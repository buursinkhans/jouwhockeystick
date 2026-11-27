/*
 * Tab "KPI" of the Marketingstudio (decision log 2026-11-27): draws what
 * social/studio/kpi.js calculates. It opens nothing itself: the daily figures
 * come from the tab Vandaag (window.jhsCijfers) and the sales figures from the
 * tab Verkoop (window.jhsVerkoop). The only thing it stores is a new version of
 * the targets, and only when the owner presses save.
 */
(() => {
  'use strict';
  const K = window.JhsKpi;
  const statusEl = document.getElementById('kp-status');
  const bar = document.getElementById('kp-bar');
  const body = document.getElementById('kp-body');
  const targetBox = document.getElementById('kp-targets');
  if (!K || !statusEl || !body) return;

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const nf = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
  const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
  const day = (iso) => (iso ? new Date(iso + 'T12:00:00Z').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '–');
  const monthName = (mo, long) => new Date(mo + '-15T12:00:00Z').toLocaleDateString('nl-NL', { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined, timeZone: 'UTC' });
  const show = (key, v) => {
    if (v === null || v === undefined) return '–';
    const unit = K.DEFS[key].unit;
    return unit === 'eur' ? eur.format(v) : unit === 'pct' ? nf1.format(v) + '%' : nf.format(v);
  };

  const TABS = { overzicht: 'Overzicht', traffic: 'Traffic', engagement: 'Engagement', conversie: 'Conversie', omzet: 'Omzet' };
  const ROWS = {
    traffic: ['googleKlikken', 'vertoningen', 'googleCtr', 'bezoeken', 'top10', 'top3'],
    engagement: ['vergelijker', 'wijzerStart', 'wijzerVoltooid', 'resultaatCtr'],
    conversie: ['partnerCtr', 'sessiesMetKlik', 'partnerKlikken', 'netwerkKlikken', 'verkopen', 'partnerConversie', 'affiliateConversie', 'websiteConversie'],
    omzet: ['affiliateOmzet', 'winkelomzet', 'orderwaarde', 'commissie', 'commissiePerVerkoop', 'omzetPer1000', 'epc'],
  };
  const STATUS = { groen: 'Op schema', oranje: 'Net onder target', rood: 'Achter op target', grijs: 'Niet beoordeeld' };
  const PLACES = { stickwijzer: 'Stickwijzer', productpagina: 'Productpagina', catalogus: 'Catalogus', vergelijk: 'Vergelijken', zaalkeuze: 'Zaalkeuze', schoenpagina: 'Schoenpagina', schoenencatalogus: 'Schoenencatalogus', schoenwijzer: 'Schoenenwijzer', blackfriday: 'Black Friday', versus: 'Reeksvergelijking', artikel: 'Artikel' };
  const SHOPS = { bolcom: 'bol.com', passasports: 'PassaHockey', plutosport: 'Plutosport', hockeycity: 'HockeyCity', daka: 'Daka', decathlon: 'Decathlon' };

  let tab = 'overzicht';
  let periodKind = 'maand';
  let chartKey = 'googleKlikken';
  let targets = null;
  let versions = [];
  let targetNote = 'Targets laden…';
  let db = null;
  let isOwner = false;
  let formMonth = null;
  let formOpen = false;
  let formMessage = '';

  const yesterday = () => K.addDays(new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' }), -1);

  const chips = (name, options, current) =>
    '<div class="chips" role="group" aria-label="' + esc(name) + '">' +
    Object.entries(options).map(([k, v]) => '<button type="button" class="chip" data-' + (name === 'Onderdeel' ? 'tab' : name === 'Periode' ? 'period' : 'chart') + '="' + esc(k) + '" aria-pressed="' + (k === current) + '">' + esc(v) + '</button>').join('') +
    '</div>';

  function delta(key, now, before) {
    if (K.DEFS[key].unit === 'pct') {
      const d = now - before;
      return (d > 0 ? '+' : '') + nf1.format(d) + ' punt';
    }
    if (before === 0) return now === 0 ? 'gelijk' : 'nieuw';
    const d = Math.round(((now - before) / before) * 100);
    return (d > 0 ? '+' : '') + d + '%';
  }

  const badge = (c) => '<span class="pill st-' + c.status + '">' + STATUS[c.status] + (c.status !== 'grijs' && c.pct !== null ? ' · ' + Math.round(c.pct * 100) + '%' : '') + '</span>';

  function targetLine(c) {
    if (c.targetNu === null) {
      return c.eersteTarget ? 'Geen target voor deze periode. Eerste target: ' + monthName(c.eersteTarget, true) + '.' : 'Geen target voor deze periode.';
    }
    const sum = K.DEFS[c.key].kind === 'som';
    let t = sum ? 'Target t/m ' + day(c.tot) + ': ' + show(c.key, c.targetNu) + (c.target !== null ? ' van ' + show(c.key, c.target) : '') : 'Target: ' + show(c.key, c.targetNu);
    if (c.vloerNu !== null) t += ' · ondergrens ' + show(c.key, c.vloerNu);
    return t;
  }

  function card(m, p, key) {
    const c = K.evaluate(m, targets, key, p);
    const trend = K.trend14(m, key);
    const lines = [targetLine(c)];
    if (c.grijs && c.waarde !== null && c.targetNu !== null) lines.push(c.grijs);
    if (c.reden) lines.push(c.reden);
    if (c.vorige) lines.push('Tegen ' + day(c.vorige.start) + ' t/m ' + day(c.vorige.end) + ': ' + delta(key, c.waarde, c.vorige.waarde));
    if (trend) lines.push('Laatste 14 dagen ' + show(key, trend.nu) + ', de 14 ervoor ' + show(key, trend.ervoor));
    if (c.prognose !== null) lines.push('Prognose maandeinde, rechtgetrokken: ' + show(key, c.prognose));
    return {
      c,
      html: '<div class="kpi kp-card"><span class="k-lbl">' + esc(K.DEFS[key].naam) + '</span><span class="k-val">' + esc(show(key, c.waarde)) + '</span><span>' + badge(c) + '</span>' +
        lines.map((l) => '<span class="k-cmp">' + esc(l) + '</span>').join('') +
        '<span class="kp-src">' + esc(K.DEFS[key].source === 'verkoop' ? 'Partnerrapporten, voorlopig' : K.DEFS[key].source === 'google' ? 'Google' : 'PostHog') + (c.tot ? ' · t/m ' + esc(day(c.tot)) : '') + '</span></div>',
    };
  }

  function chart(m) {
    const months = K.monthsIn('2026-10-01', '2027-12-31');
    const s = K.series(m, targets, chartKey, months);
    const max = Math.max(1, ...s.flatMap((x) => [x.waarde || 0, x.primair || 0, x.vloer || 0, x.ambitie || 0]));
    /* Drawn at the width it gets, so the labels keep their size on a phone and on a wide screen. */
    const W = Math.max(300, (body.clientWidth || 600) - 34), H = 220, base = H - 24, slot = W / months.length;
    const every = slot >= 36 ? 1 : slot >= 22 ? 2 : 3;
    const y = (v) => base - (v / max) * (base - 14);
    const mark = (x, v, cls) => (v === null ? '' : '<line class="' + cls + '" x1="' + (x + 3) + '" x2="' + (x + slot - 3) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>');
    const svg = s.map((r, i) => {
      const x = i * slot;
      const title = monthName(r.maand, true) + ': ' + (r.waarde === null ? 'geen cijfers' : show(chartKey, r.waarde) + (r.deels ? ' (nog niet de hele maand)' : '')) + (r.primair === null ? '' : ', target ' + show(chartKey, r.primair));
      return '<g><title>' + esc(title) + '</title><rect class="hit" x="' + x + '" y="0" width="' + slot + '" height="' + base + '"/>' +
        (r.waarde === null ? '' : '<rect class="act' + (r.deels ? ' part' : '') + '" x="' + (x + slot * 0.22) + '" y="' + y(r.waarde) + '" width="' + slot * 0.56 + '" height="' + Math.max(0, base - y(r.waarde)) + '"/>') +
        mark(x, r.ambitie, 'amb') + mark(x, r.vloer, 'low') + mark(x, r.primair, 'aim') +
        (i % every === 0 ? '<text x="' + (x + slot / 2) + '" y="' + (H - 8) + '">' + esc(monthName(r.maand).replace('.', '')) + '</text>' : '') + '</g>';
    }).join('');
    const options = Object.fromEntries(K.PRIMARY.map((k) => [k, K.DEFS[k].naam]));
    return '<div class="td-card kp-wide"><h3>Groei tegen plan</h3>' + chips('Grafiek', options, chartKey) +
      '<svg class="kp-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(K.DEFS[chartKey].naam + ' per maand, werkelijk en target') + '"><text class="max" x="0" y="11">' + esc(show(chartKey, max)) + '</text><line class="axis" x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '"/>' + svg + '</svg>' +
      '<span class="sub">Balk: werkelijk (licht: maand nog niet compleet). Doorgetrokken streep: target. Gestreept: ondergrens. Gestippeld: ambitie.</span>' +
      '<details><summary>Als tabel</summary><table class="td-table"><thead><tr><th>Maand</th><th class="n">Werkelijk</th><th class="n">Ondergrens</th><th class="n">Target</th><th class="n">Ambitie</th></tr></thead><tbody>' +
      s.map((r) => '<tr><td>' + esc(monthName(r.maand, true)) + '</td><td class="n">' + esc(show(chartKey, r.waarde)) + (r.deels ? ' *' : '') + '</td><td class="n">' + esc(show(chartKey, r.vloer)) + '</td><td class="n">' + esc(show(chartKey, r.primair)) + '</td><td class="n">' + esc(show(chartKey, r.ambitie)) + '</td></tr>').join('') +
      '</tbody></table></details></div>';
  }

  function analysisCard(cards) {
    const a = K.analysis(cards);
    const say = (c) => K.DEFS[c.key].naam + ': ' + show(c.key, c.waarde) + ' tegen ' + show(c.key, c.targetNu) + ' (' + Math.round(c.pct * 100) + '% van het target, t/m ' + day(c.tot) + ').';
    let h = '<div class="td-card"><h3>Analyse</h3><span class="sub">Vaste rekenregels, alleen over beoordeelde kaarten</span>';
    if (a.tekst) h += '<p>' + esc(a.tekst) + '</p>';
    if (a.afwijking) h += '<p><b>Grootste afwijking.</b> ' + esc(say(a.afwijking)) + '</p>';
    if (a.positief) h += '<p><b>Sterkste punt.</b> ' + esc(say(a.positief)) + '</p>';
    if (!a.tekst && !a.afwijking) h += '<p>Alle beoordeelde KPI\'s liggen op of boven het target.</p>';
    return h + '</div>';
  }

  function dataCard(m, p) {
    let technisch = 0, buiten = 0;
    for (const [date, row] of m.days) {
      if (date >= p.start && date <= p.end) { technisch += row.technisch; buiten += row.buitenEuropa; }
    }
    const rows = [
      ['PostHog', m.range.sessies.last ? 't/m ' + day(m.range.sessies.last) : 'ontbreekt', 'bezoeken, Partner-CTR, engagement'],
      ['Google Search Console', m.range.google.last ? 't/m ' + day(m.range.google.last) : 'ontbreekt', 'klikken, vertoningen, CTR'],
      ['Partnerrapporten', m.salesRead ? 'gelezen ' + new Date(m.salesRead).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'niet geopend', 'verkopen, omzet'],
    ];
    return '<div class="td-card"><h3>Stand van de data</h3><table class="td-table"><thead><tr><th>Bron</th><th>Laatste cijfers</th><th>Gebruikt voor</th></tr></thead><tbody>' +
      rows.map((r) => '<tr>' + r.map((v) => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table>' +
      m.errors.map((e) => '<p class="vk-err">' + esc(e.bron + ' niet gelezen: ' + e.reden) + '</p>').join('') +
      (m.days.size ? '<span class="sub">Niet meegeteld in deze periode: ' + nf.format(technisch) + ' bezoeken met kenmerken van een bot, ' + nf.format(buiten) + ' van buiten Europa. Verkopen zijn zonder Decathlon.</span>' : '') +
      '</div>';
  }

  function kpiTable(m, p, keys, title) {
    const rows = keys.map((key) => {
      const c = K.evaluate(m, targets, key, p);
      const note = [c.reden, c.grijs && c.grijs !== c.reden && c.targetNu !== null ? c.grijs : ''].filter(Boolean).map((t) => t.replace(/\.$/, '')).join('. ');
      return '<tr><td class="q">' + esc(K.DEFS[key].naam) + (note ? '<br><span class="sub">' + esc(note) + '</span>' : '') + '</td>' +
        '<td class="n">' + esc(show(key, c.waarde)) + '</td><td class="n">' + esc(show(key, c.targetNu)) + '</td>' +
        '<td class="n">' + esc(c.vorige ? delta(key, c.waarde, c.vorige.waarde) : '–') + '</td>' +
        '<td>' + (K.TARGETABLE.includes(key) ? badge(c) : '<span class="sub">geen target</span>') + '</td></tr>';
    }).join('');
    return '<div class="td-card kp-wide"><h3>' + esc(title) + '</h3><table class="td-table"><thead><tr><th>KPI</th><th class="n">Werkelijk</th><th class="n">Target tot nu</th><th class="n">Verschil</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  const definitions = (keys) =>
    '<details class="td-card kp-wide"><summary>Definities</summary>' +
    keys.map((k) => {
      const d = K.DEFS[k];
      return '<p><b>' + esc(d.naam) + '.</b> ' + esc('Formule: ' + d.formule + '. Bron: ' + d.bron + '. Ververst: ' + d.frequentie + ' door ' + d.eigenaar + '. ' + d.aannames + ' Beperking: ' + d.beperkingen) + '</p>';
    }).join('') + '</details>';

  function groupCard(title, sub, rows, name) {
    if (!rows || !rows.length) return '<div class="td-card"><h3>' + esc(title) + '</h3><span class="sub">Nog niets.</span></div>';
    const clicks = 'klikken' in rows[0];
    return '<div class="td-card"><h3>' + esc(title) + '</h3><span class="sub">' + esc(sub) + '</span><table class="td-table"><thead><tr><th></th>' +
      (clicks ? '<th class="n">Klikken</th>' : '<th class="n">Bezoeken</th><th class="n">Met klik</th>') + '</tr></thead><tbody>' +
      rows.map((r) => '<tr><td class="q">' + esc(name ? name(r.key) : r.key) + '</td>' +
        (clicks ? '<td class="n">' + nf.format(r.klikken) + '</td>' : '<td class="n">' + nf.format(r.sessies) + '</td><td class="n">' + nf.format(r.metKlik) + '</td>') + '</tr>').join('') +
      '</tbody></table></div>';
  }

  function partnerCard(m, p) {
    const months = p.months.filter((mo) => m.sales.has(mo));
    if (!months.length) {
      return '<div class="td-card kp-wide"><h3>Per partner en maand</h3><span class="sub">' + (m.sales.size ? 'Geen verkoopcijfers in deze periode.' : 'Open de verkoopcijfers op het tabblad <a href="#verkoop">Verkoop</a>.') + '</span></div>';
    }
    const cell = (v, f) => '<td class="n">' + (typeof v === 'number' ? esc(f.format(v)) : '–') + '</td>';
    const rows = months.flatMap((mo) =>
      Object.entries(m.sales.get(mo).partners).map(([id, v]) =>
        '<tr><td class="q">' + esc(monthName(mo, true)) + '</td><td class="q">' + esc(K.PARTNERS[id] || id) + '</td>' +
        (v && !('fout' in v) ? cell(v.kliks, nf) + cell(v.orders, nf) + cell(v.omzet, eur) + cell(v.commissie, eur) : '<td colspan="4" class="na">niet gelezen</td>') + '</tr>'));
    return '<div class="td-card kp-wide"><h3>Per partner en maand</h3><span class="sub">Voorlopig: goedgekeurd en nog te beoordelen samen, afgewezen orders niet.</span><table class="td-table"><thead><tr><th>Maand</th><th>Partner</th><th class="n">Kliks</th><th class="n">Orders</th><th class="n">Orderwaarde</th><th class="n">Commissie</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  }

  function render() {
    const f = window.jhsCijfers;
    if (!f) { statusEl.textContent = 'Cijfers laden…'; return; }
    if (f.locked) {
      statusEl.textContent = 'De cijfers zijn versleuteld.';
      bar.innerHTML = '';
      body.innerHTML = '<div class="td-card"><h3>De cijfers zijn versleuteld</h3><span class="sub">Ze openen met dezelfde sleutel als het tabblad <a href="#verkoop">Verkoop</a>: typ die daar één keer.</span></div>';
      return;
    }
    const m = K.model(f.c, window.jhsVerkoop);
    const p = K.period(periodKind, m.tot || yesterday());
    statusEl.innerHTML = '<b>' + esc(p.label) + '</b>: ' + esc(day(p.start)) + ' t/m ' + esc(day(p.end)) + (targets ? ' · targets van ' + esc(new Date(targets.vastgelegd).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })) : ' · ' + esc(targetNote));
    bar.innerHTML = chips('Onderdeel', TABS, tab) + chips('Periode', K.PERIODS, periodKind);

    let h = '';
    if (!f.c || !f.c.kpi) {
      h += '<p class="td-empty">De KPI-cijfers komen bij de eerstvolgende run van de dagcijfers. Oudere dagcijfers hebben dit deel nog niet.</p>';
    }
    const b = m.breakdown;
    const span = b ? 'Laatste 28 dagen, ' + day(b.periode.start) + ' t/m ' + day(b.periode.end) : '';
    if (tab === 'overzicht') {
      const cards = K.PRIMARY.map((k) => card(m, p, k));
      h += '<div class="td-kpis kp-cards">' + cards.map((c) => c.html).join('') + '</div>';
      h += chart(m);
      h += '<div class="td-grid">' + analysisCard(cards.map((c) => c.c)) + dataCard(m, p) + '</div>';
      h += definitions(K.PRIMARY);
    } else {
      h += kpiTable(m, p, ROWS[tab], TABS[tab]);
      if (tab === 'traffic') {
        h += '<div class="td-grid">' + groupCard('Herkomst', span, b && b.bronnen) + groupCard('Apparaat', span, b && b.apparaten) + groupCard('Eerste pagina', span, b && b.paginagroepen) + '</div>';
      } else if (tab === 'conversie') {
        h += '<div class="td-grid">' + groupCard('Klikken per winkel', span, b && b.winkels, (k) => SHOPS[k] || k) + groupCard('Klikken per plek', span, b && b.plaatsingen, (k) => PLACES[k] || k) + groupCard('Pagina\'s met een partnerklik', span, b && b.paginas) + '</div>';
      } else if (tab === 'omzet') {
        h += partnerCard(m, p);
      }
      h += definitions(ROWS[tab]);
    }
    body.innerHTML = h;
  }

  /* ---- targets: shown and edited apart from the figures, so a data refresh never wipes what is being typed ---- */
  function targetMonths() {
    const set = new Set(K.monthsIn('2026-12-01', '2027-12-31'));
    Object.keys((targets && targets.maanden) || {}).forEach((mo) => set.add(mo));
    return [...set].sort();
  }

  function renderTargets() {
    if (!targetBox) return;
    targetBox.hidden = tab !== 'overzicht' || !db || !isOwner;
    if (targetBox.hidden) return;
    const months = targetMonths();
    if (!months.includes(formMonth)) formMonth = months[0];
    const entry = (targets && targets.maanden[formMonth]) || {};
    const input = (key, field, label) =>
      '<input type="number" min="0" step="any" inputmode="decimal" data-key="' + key + '" data-field="' + field + '" aria-label="' + esc(K.DEFS[key].naam + ', ' + label) + '" value="' + esc(entry[key] && entry[key][field] !== undefined ? entry[key][field] : '') + '">';
    targetBox.innerHTML = '<details class="td-card kp-form"' + (formOpen ? ' open' : '') + '><summary>Targets beheren</summary>' +
      '<span class="sub">Targets per maand, alleen zichtbaar voor beheerders van deze studio. Opslaan maakt een nieuwe versie; oude versies blijven staan. Percentages als getal (10 betekent 10%). Leeg betekent: geen target.</span>' +
      (targets && targets.toelichting ? '<span class="sub">' + esc(targets.toelichting) + '</span>' : '') +
      '<label>Maand <select id="kp-month">' + months.map((mo) => '<option value="' + mo + '"' + (mo === formMonth ? ' selected' : '') + '>' + esc(monthName(mo, true)) + '</option>').join('') + '</select></label>' +
      '<form id="kp-targetform"><table class="td-table"><thead><tr><th>KPI</th><th>Ondergrens</th><th>Target</th><th>Ambitie</th></tr></thead><tbody>' +
      K.TARGETABLE.map((key) => '<tr><td class="q">' + esc(K.DEFS[key].naam) + '</td><td>' + input(key, 'vloer', 'ondergrens') + '</td><td>' + input(key, 'primair', 'target') + '</td><td>' + input(key, 'ambitie', 'ambitie') + '</td></tr>').join('') +
      '</tbody></table><button type="submit" class="chip">Nieuwe versie opslaan</button> <span role="status">' + esc(formMessage) + '</span></form>' +
      (versions.length ? '<span class="sub">Versies: ' + versions.map((v) => esc(new Date(v.vastgelegd).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }))).join(' · ') + '</span>' : '') +
      '</details>';
    const details = targetBox.querySelector('details');
    details.addEventListener('toggle', () => { formOpen = details.open; });
    document.getElementById('kp-month').addEventListener('change', (ev) => { formMonth = ev.target.value; formMessage = ''; renderTargets(); });
    document.getElementById('kp-targetform').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const values = {};
      ev.currentTarget.querySelectorAll('input[data-key]').forEach((el) => {
        if (el.value === '') return;
        (values[el.dataset.key] = values[el.dataset.key] || {})[el.dataset.field] = Number(el.value);
      });
      const next = K.newVersion(targets, formMonth, values, new Date().toISOString(), targets ? targets.toelichting : '');
      try {
        await db.collection('targets').doc('t' + Date.now()).set(next);
        formMessage = 'Opgeslagen.';
      } catch {
        formMessage = 'Opslaan is niet gelukt.';
      }
      renderTargets();
    });
  }

  bar.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.tab) { tab = b.dataset.tab; renderTargets(); }
    if (b.dataset.period) periodKind = b.dataset.period;
    render();
  });
  body.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-chart]');
    if (!b) return;
    chartKey = b.dataset.chart;
    render();
  });
  window.addEventListener('jhs-cijfers', render);
  window.addEventListener('jhs-verkoop', render);
  /* The tab is drawn while hidden too: draw again when it is opened, so the chart gets its real width. */
  window.addEventListener('hashchange', () => { if (location.hash === '#kpi') render(); });
  render();
  setTimeout(() => {
    if (!window.jhsCijfers) { statusEl.textContent = 'Alleen voor de eigenaar.'; body.innerHTML = '<p class="td-empty">De KPI-cijfers zijn alleen zichtbaar voor de eigenaar, ingelogd op claude.ai.</p>'; }
  }, 12000);

  (async () => {
    if (!window.claude || !window.claude.use) return;
    const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!d) return;
    db = d;
    isOwner = u ? await u.isOwner().catch(() => false) : false;
    db.collection('targets').orderBy('vastgelegd', 'desc').limit(20).onSnapshot(
      (snap) => {
        versions = snap.docs.map((x) => x.data()).filter((x) => x && x.vastgelegd);
        targets = K.latestTargets(versions);
        targetNote = targets ? '' : 'nog geen targets ingevoerd';
        render();
        renderTargets();
      },
      () => { targetNote = 'targets niet gelezen'; render(); },
    );
  })();
})();
