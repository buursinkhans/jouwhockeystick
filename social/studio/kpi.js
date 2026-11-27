/*
 * KPI Performance of the Marketingstudio (decision log 2026-11-27): the one place
 * where the KPIs are defined and calculated. Pure functions, no page and no
 * database; social/studio/kpi-tab.js draws the result. Tested by
 * src/kpi/studioKpi.test.ts. Published with the studio as the file kpi.js.
 *
 * Input: the opened daily figures (their `kpi` part, src/kpi/data.ts), the opened
 * sales file (`maanden`, scripts/daily-sales.ts) and the targets from the
 * studio's database. This file holds no target values.
 */
(() => {
  'use strict';

  /* Same order as DAY_COLUMNS in src/kpi/data.ts. */
  const DAY_COLUMNS = ['date', 'sessies', 'metKlik', 'klikken', 'vergelijker', 'homepage', 'homepageStart', 'wijzerStart', 'wijzerKlaar', 'resultaat', 'resultaatKlik', 'technisch', 'buitenEuropa'];
  const PARTNERS = { bol: 'bol.com', passahockey: 'PassaHockey', hockeycity: 'HockeyCity', plutosport: 'Plutosport', daka: 'Daka' };

  /* A ratio over fewer cases, or sales figures over fewer orders, get no colour. */
  const MIN_DENOMINATOR = 30;
  const MIN_ORDERS = 10;
  const FORECAST_FROM_DAY = 10;

  const SESSIONS = 'PostHog (dagcijfers), na het bezoekersfilter';
  const GOOGLE = 'Google Search Console (dagcijfers)';
  const SALES = 'Partnerrapporten (tabblad Verkoop), per maand, zonder Decathlon';
  const OWNER_METRICS = 'scripts/daily-metrics.ts (workflow Dagcijfers)';
  const OWNER_SALES = 'scripts/daily-sales.ts (workflow Dagcijfers)';
  const VISIT = 'Een bezoek is een sessie met minstens één paginaweergave, geteld op de dag waarop die begon.';
  const PENDING = 'Voorlopig: orders die de partner nog moet goedkeuren tellen mee, afgewezen orders niet.';

  /* kind: 'som' adds up over a period (target pro rata), 'ratio' is computed from the totals (full target). */
  const def = (naam, kind, unit, source, teller, noemer, bron, aannames, beperkingen) => ({
    naam,
    kind,
    unit,
    source,
    teller,
    noemer,
    formule: noemer ? teller + ' / ' + noemer : 'som van ' + teller,
    bron,
    frequentie: source === 'verkoop' ? 'drie keer per dag, per kalendermaand' : source === 'google' ? 'dagelijks, loopt ongeveer drie dagen achter' : 'dagelijks, tot en met gisteren',
    eigenaar: source === 'verkoop' ? OWNER_SALES : source === 'gemengd' ? OWNER_METRICS + ' en ' + OWNER_SALES : OWNER_METRICS,
    aannames,
    beperkingen,
  });

  const DEFS = {
    googleKlikken: def('Google-klikken', 'som', 'n', 'google', 'klikken', '', GOOGLE, 'Alle organische klikken in Google.', 'De laatste drie dagen ontbreken.'),
    bezoeken: def('Websitebezoeken', 'som', 'n', 'sessies', 'bezoeken', '', SESSIONS, VISIT, 'Zonder cookies; hetzelfde apparaat op twee dagen telt twee keer.'),
    partnerCtr: def('Partner-CTR', 'ratio', 'pct', 'sessies', 'bezoeken met een partnerklik', 'alle bezoeken', SESSIONS, VISIT, 'Een klik zegt niets over een bestelling.'),
    verkopen: def('Verkopen', 'som', 'n', 'verkoop', 'orders', '', SALES, PENDING, 'Alleen per maand; niet te herleiden tot een bezoek.'),
    affiliateOmzet: def('Affiliate-omzet', 'som', 'eur', 'verkoop', 'commissie', '', SALES, PENDING, 'Goedgekeurd en voorlopig staan nog niet apart.'),
    vertoningen: def('Google-vertoningen', 'som', 'n', 'google', 'vertoningen', '', GOOGLE, 'Alle organische vertoningen.', 'De laatste drie dagen ontbreken.'),
    googleCtr: def('Google CTR', 'ratio', 'pct', 'google', 'klikken', 'vertoningen', GOOGLE, 'Totalen over de periode.', 'De laatste drie dagen ontbreken.'),
    top10: def('Relevante zoektermen top 10', 'stand', 'n', 'geen', 'zoektermen', '', 'Nog niet gemeten', 'De lijst met relevante zoektermen moet nog worden vastgelegd.', 'Komt in een latere fase.'),
    top3: def('Relevante zoektermen top 3', 'stand', 'n', 'geen', 'zoektermen', '', 'Nog niet gemeten', 'De lijst met relevante zoektermen moet nog worden vastgelegd.', 'Komt in een latere fase.'),
    vergelijker: def('Gebruik productvergelijker', 'ratio', 'pct', 'sessies', 'bezoeken met een vergelijkactie', 'alle bezoeken', SESSIONS, 'Vergelijkactie: offer_compare_click, product_card_click, indoor_selection, versus_view of catalog_block_click.', 'Een gewone paginaweergave telt niet.'),
    wijzerStart: def('Start Stickwijzer', 'ratio', 'pct', 'sessies', 'bezoeken aan de startpagina met een gestarte wijzer', 'bezoeken aan de startpagina', SESSIONS, 'Alleen bezoeken die de startpagina zagen.', 'Starts van elders tellen hier niet mee.'),
    wijzerVoltooid: def('Voltooiing Stickwijzer', 'ratio', 'pct', 'sessies', 'bezoeken met gestart en afgerond', 'bezoeken met gestart', SESSIONS, 'Binnen hetzelfde bezoek.', 'Later afronden telt niet.'),
    resultaatCtr: def('Klik vanuit het wijzerresultaat', 'ratio', 'pct', 'sessies', 'bezoeken met een partnerklik in het stickadvies', 'bezoeken met een resultaat', SESSIONS, 'Klik met plek "stickwijzer".', 'Klikken na doorbladeren naar een stickpagina tellen niet.'),
    sessiesMetKlik: def('Bezoeken met partnerklik', 'som', 'n', 'sessies', 'bezoeken met een partnerklik', '', SESSIONS, VISIT, 'Een klik zegt niets over een bestelling.'),
    partnerKlikken: def('Partnerklikken (site)', 'som', 'n', 'sessies', 'klikken naar een winkel', '', SESSIONS, 'Elke klik telt.', 'Wijkt af van de kliks die netwerken registreren.'),
    netwerkKlikken: def('Geregistreerde affiliateklikken', 'som', 'n', 'verkoop', 'kliks volgens de netwerken', '', SALES, 'Zoals de partner rapporteert.', 'Daka geeft geen kliks.'),
    partnerConversie: def('Indicatieve partnerconversie', 'ratio', 'pct', 'gemengd', 'orders', 'bezoeken met een partnerklik', SALES + '; ' + SESSIONS, 'Het rekenmodel achter de targets.', 'Twee databronnen, geen bewezen conversie per bezoeker.'),
    affiliateConversie: def('Affiliateconversie', 'ratio', 'pct', 'verkoop', 'orders van partners met kliks', 'geregistreerde affiliateklikken', SALES, 'Zonder Daka.', 'Een order kan van een klik in een eerdere maand komen.'),
    websiteConversie: def('Indicatieve websiteconversie', 'ratio', 'pct', 'gemengd', 'orders', 'bezoeken', SALES + '; ' + SESSIONS, 'Dezelfde maanden.', 'Twee databronnen, geen bewezen conversie per bezoeker.'),
    winkelomzet: def('Gegenereerde winkelomzet', 'som', 'eur', 'verkoop', 'orderwaarde', '', SALES, PENDING, 'Niet elke partner geeft de orderwaarde.'),
    orderwaarde: def('Gemiddelde orderwaarde', 'ratio', 'eur', 'verkoop', 'orderwaarde', 'orders van partners met orderwaarde', SALES, PENDING, 'Alleen partners die de orderwaarde geven.'),
    commissie: def('Gemiddelde commissie', 'ratio', 'pct', 'verkoop', 'commissie van partners met orderwaarde', 'orderwaarde', SALES, PENDING, 'Alleen partners die de orderwaarde geven.'),
    commissiePerVerkoop: def('Commissie per verkoop', 'ratio', 'eur', 'verkoop', 'commissie', 'orders', SALES, PENDING, 'Kleine aantallen schommelen sterk.'),
    omzetPer1000: def('Omzet per 1.000 bezoeken', 'ratio', 'eur', 'gemengd', 'commissie x 1.000', 'bezoeken', SALES + '; ' + SESSIONS, 'Dezelfde maanden.', 'Twee databronnen.'),
    epc: def('Verdiensten per klik (EPC)', 'ratio', 'eur', 'verkoop', 'commissie van partners met kliks', 'geregistreerde affiliateklikken', SALES, 'Zonder Daka.', 'Een order kan van een klik in een eerdere maand komen.'),
  };
  const PRIMARY = ['googleKlikken', 'bezoeken', 'partnerCtr', 'verkopen', 'affiliateOmzet'];
  /* The KPIs a target can be set for, in the order of the form. */
  const TARGETABLE = ['googleKlikken', 'bezoeken', 'partnerCtr', 'verkopen', 'affiliateOmzet', 'vertoningen', 'googleCtr', 'top10', 'top3', 'vergelijker', 'wijzerStart', 'wijzerVoltooid', 'resultaatCtr', 'sessiesMetKlik', 'partnerConversie', 'orderwaarde', 'commissie', 'winkelomzet'];

  /* ---- dates (all YYYY-MM-DD, UTC arithmetic) ---- */
  const DAY = 86400000;
  const time = (d) => Date.parse(d + 'T00:00:00Z');
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const addDays = (d, n) => iso(time(d) + n * DAY);
  const daysBetween = (a, b) => Math.round((time(b) - time(a)) / DAY) + 1;
  const monthStart = (y, m) => iso(Date.UTC(y, m, 1));
  const monthEnd = (y, m) => iso(Date.UTC(y, m + 1, 0));
  const parts = (d) => [Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1];
  const dim = (month) => { const [y, m] = parts(month + '-01'); return Number(monthEnd(y, m).slice(8)); };
  function monthsIn(from, to) {
    const out = [];
    let [y, m] = parts(from);
    for (let d = monthStart(y, m); d <= to; d = monthStart(y, ++m)) out.push(d.slice(0, 7));
    return out;
  }
  const minDate = (a, b) => (a < b ? a : b);

  const PERIODS = { maand: 'Deze maand', vorigeMaand: 'Vorige maand', kwartaal: 'Dit kwartaal', vorigKwartaal: 'Vorig kwartaal', jaar: 'Jaar tot nu' };

  /* `ref` is the last full day. start/fullEnd are the calendar period, end is the part that has passed. */
  function period(kind, ref) {
    const [y, m] = parts(ref);
    const q = Math.floor(m / 3) * 3;
    const ranges = {
      maand: [monthStart(y, m), monthEnd(y, m)],
      vorigeMaand: [monthStart(y, m - 1), monthEnd(y, m - 1)],
      kwartaal: [monthStart(y, q), monthEnd(y, q + 2)],
      vorigKwartaal: [monthStart(y, q - 3), monthEnd(y, q - 1)],
      jaar: [monthStart(y, 0), monthEnd(y, 11)],
    };
    const key = ranges[kind] ? kind : 'maand';
    const [start, fullEnd] = ranges[key];
    return { key, label: PERIODS[key], start, fullEnd, end: minDate(fullEnd, ref), months: monthsIn(start, fullEnd) };
  }

  /* The comparable earlier range for a range that ends at `through`; null when there is none. */
  function previous(p, through) {
    const [y, m] = parts(p.start);
    if (p.key === 'maand' || p.key === 'vorigeMaand') {
      const start = monthStart(y, m - 1);
      const end = monthEnd(y, m - 1);
      return { start, end: through >= p.fullEnd ? end : minDate(addDays(start, daysBetween(p.start, through) - 1), end) };
    }
    if (p.key === 'kwartaal' || p.key === 'vorigKwartaal') {
      const start = monthStart(y, m - 3);
      const end = monthEnd(y, m - 1);
      return { start, end: through >= p.fullEnd ? end : minDate(addDays(start, daysBetween(p.start, through) - 1), end) };
    }
    return null;
  }

  /* ---- the data ---- */
  function model(cijfers, verkoop) {
    const k = cijfers && cijfers.kpi;
    const m = { tot: k ? k.tot : null, days: new Map(), google: new Map(), sales: new Map(), breakdown: null, errors: [], salesRead: null };
    if (k && k.sessies && k.sessies.ok) {
      for (const row of k.sessies.value.dagen) m.days.set(row[0], Object.fromEntries(DAY_COLUMNS.map((c, i) => [c, row[i]])));
      m.breakdown = k.sessies.value.uitsplitsing;
    } else if (k && k.sessies) m.errors.push({ bron: 'PostHog', reden: k.sessies.reden });
    if (k && k.google && k.google.ok) {
      for (const [date, klikken, vertoningen] of k.google.value.dagen) m.google.set(date, { klikken, vertoningen });
    } else if (k && k.google) m.errors.push({ bron: 'Google Search Console', reden: k.google.reden });
    if (verkoop) {
      m.salesRead = verkoop.gemaakt || null;
      for (const month of verkoop.maanden || []) m.sales.set(month.maand, month);
    }
    const last = (map) => [...map.keys()].sort().at(-1) || null;
    const first = (map) => [...map.keys()].sort()[0] || null;
    m.range = {
      sessies: { first: first(m.days), last: last(m.days) },
      google: { first: first(m.google), last: last(m.google) },
    };
    return m;
  }

  /* Sum of daily rows over a range. `compleet` is false when the data starts after the range does. */
  function daily(map, range, start, end) {
    if (!range.first || end < range.first || start > range.last) return null;
    const from = start > range.first ? start : range.first;
    const to = minDate(end, range.last);
    const total = {};
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const row = map.get(d);
      if (!row) return null;
      for (const [k, v] of Object.entries(row)) if (typeof v === 'number') total[k] = (total[k] || 0) + v;
    }
    return { total, from, to, compleet: from === start };
  }

  /* Sales of whole months. Amounts a partner did not give stay out and are named. */
  function sales(m, months) {
    const t = { orders: 0, commissie: 0, commissieOnbekend: [], omzet: 0, ordersOmzet: 0, commissieOmzet: 0, zonderOmzet: [], kliks: 0, ordersKliks: 0, commissieKliks: 0, zonderKliks: [], fout: [], ontbreekt: [], tot: null };
    const name = (list, id) => { if (!list.includes(PARTNERS[id] || id)) list.push(PARTNERS[id] || id); };
    let any = false;
    for (const month of months) {
      const row = m.sales.get(month);
      if (!row) { t.ontbreekt.push(month); continue; }
      any = true;
      if (!t.tot || row.to > t.tot) t.tot = row.to;
      for (const [id, v] of Object.entries(row.partners || {})) {
        if (!v || 'fout' in v) { name(t.fout, id); continue; }
        t.orders += v.orders || 0;
        if (typeof v.commissie === 'number') t.commissie += v.commissie;
        else if (v.orders) name(t.commissieOnbekend, id);
        if (typeof v.omzet === 'number') {
          t.omzet += v.omzet;
          t.ordersOmzet += v.orders || 0;
          t.commissieOmzet += v.commissie || 0;
        } else if (v.orders) name(t.zonderOmzet, id);
        if (typeof v.kliks === 'number') {
          t.kliks += v.kliks;
          t.ordersKliks += v.orders || 0;
          t.commissieKliks += v.commissie || 0;
        } else name(t.zonderKliks, id);
      }
    }
    return any ? t : null;
  }

  const missing = (reden) => ({ waarde: null, teller: null, noemer: null, tot: null, compleet: false, onvolledig: false, orders: null, reden });
  const ratio = (teller, noemer, factor) => (noemer > 0 ? (teller / noemer) * factor : null);

  /* The value of a KPI over start..end, from the totals. Missing is null, never zero. */
  function value(m, key, start, end) {
    const d = DEFS[key];
    if (!d || d.source === 'geen') return missing('Nog niet gemeten.');
    const out = (teller, noemer, data, extra) => ({
      waarde: noemer === null ? teller : ratio(teller, noemer, d.unit === 'pct' ? 100 : key === 'omzetPer1000' ? 1000 : 1),
      teller,
      noemer,
      tot: data.to,
      compleet: data.compleet,
      onvolledig: false,
      orders: null,
      reden: noemer === 0 ? 'Nog geen ' + d.noemer + '.' : '',
      ...extra,
    });
    if (d.source === 'google') {
      const g = daily(m.google, m.range.google, start, end);
      if (!g) return missing('Geen cijfers uit Google voor deze periode.');
      if (key === 'googleCtr') return out(g.total.klikken || 0, g.total.vertoningen || 0, g);
      return out(g.total[key === 'vertoningen' ? 'vertoningen' : 'klikken'] || 0, null, g);
    }
    if (d.source === 'sessies') {
      const s = daily(m.days, m.range.sessies, start, end);
      if (!s) return missing('Geen cijfers uit PostHog voor deze periode.');
      const t = (c) => s.total[c] || 0;
      const map = {
        bezoeken: [t('sessies'), null],
        sessiesMetKlik: [t('metKlik'), null],
        partnerKlikken: [t('klikken'), null],
        partnerCtr: [t('metKlik'), t('sessies')],
        vergelijker: [t('vergelijker'), t('sessies')],
        wijzerStart: [t('homepageStart'), t('homepage')],
        wijzerVoltooid: [t('wijzerKlaar'), t('wijzerStart')],
        resultaatCtr: [t('resultaatKlik'), t('resultaat')],
      };
      return out(map[key][0], map[key][1], s);
    }
    /* Sales come per calendar month: the range must start and end on one. */
    const months = monthsIn(start, end);
    const s = sales(m, months);
    if (!s) return missing(m.sales.size ? 'Geen verkoopcijfers voor deze maanden.' : 'Nog geen verkoopcijfers geopend (tabblad Verkoop).');
    const data = { to: s.tot, compleet: !s.ontbreekt.length };
    const warn = [];
    if (s.fout.length) warn.push(s.fout.join(', ') + ' niet gelezen');
    if (s.ontbreekt.length) warn.push('maanden zonder cijfers: ' + s.ontbreekt.join(', '));
    if (s.commissieOnbekend.length && /commissie|affiliateOmzet|epc|omzetPer1000/i.test(key)) warn.push(s.commissieOnbekend.join(', ') + ' zonder commissiebedrag');
    const extra = { orders: s.orders, onvolledig: warn.length > 0 };
    const result = (teller, noemer, notes) => {
      const r = out(teller, noemer, data, extra);
      r.reden = [r.reden, ...warn, ...(notes || [])].filter(Boolean).join('; ');
      return r;
    };
    const without = (list, what) => (list.length ? [list.join(', ') + ' ' + what] : []);
    if (d.source === 'gemengd') {
      const se = daily(m.days, m.range.sessies, start, s.tot);
      if (!se) return missing('Geen cijfers uit PostHog voor dezelfde maanden.');
      extra.onvolledig = extra.onvolledig || !se.compleet;
      const note = se.compleet ? [] : ['bezoeken pas gemeten vanaf ' + se.from];
      if (key === 'partnerConversie') return result(s.orders, se.total.metKlik || 0, note);
      if (key === 'websiteConversie') return result(s.orders, se.total.sessies || 0, note);
      return result(s.commissie, se.total.sessies || 0, note);
    }
    switch (key) {
      case 'verkopen': return result(s.orders, null);
      case 'affiliateOmzet': return result(s.commissie, null);
      case 'netwerkKlikken': return result(s.kliks, null, without(s.zonderKliks, 'geeft geen kliks'));
      case 'affiliateConversie': return result(s.ordersKliks, s.kliks, without(s.zonderKliks, 'geeft geen kliks'));
      case 'epc': return result(s.commissieKliks, s.kliks, without(s.zonderKliks, 'geeft geen kliks'));
      case 'winkelomzet': return result(s.omzet, null, without(s.zonderOmzet, 'geeft geen orderwaarde'));
      case 'orderwaarde': return result(s.omzet, s.ordersOmzet, without(s.zonderOmzet, 'geeft geen orderwaarde'));
      case 'commissie': return result(s.commissieOmzet, s.omzet, without(s.zonderOmzet, 'geeft geen orderwaarde'));
      case 'commissiePerVerkoop': return result(s.commissie, s.orders);
      default: return missing('Onbekende KPI.');
    }
  }

  /* ---- targets ---- */
  const FIELDS = ['vloer', 'primair', 'ambitie'];
  const amount = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

  /* Targets are stored as versions that are never overwritten; the newest one counts. */
  function latestTargets(docs) {
    return (docs || []).filter((d) => d && d.versie === 1 && d.maanden && d.vastgelegd).sort((a, b) => String(a.vastgelegd).localeCompare(String(b.vastgelegd))).at(-1) || null;
  }

  /* A new version: the current one with one month replaced. Empty fields mean "no target". */
  function newVersion(current, month, values, now, toelichting) {
    const maanden = JSON.parse(JSON.stringify((current && current.maanden) || {}));
    const entry = {};
    for (const key of TARGETABLE) {
      const row = {};
      for (const f of FIELDS) {
        const v = amount(values && values[key] && values[key][f]);
        if (v !== null) row[f] = v;
      }
      if (Object.keys(row).length) entry[key] = row;
    }
    if (Object.keys(entry).length) maanden[month] = entry;
    else delete maanden[month];
    return { versie: 1, vastgelegd: now, toelichting: toelichting || '', maanden };
  }

  /* One field of a KPI over some months: sums need every month, a ratio needs the same value in every month. */
  function targetField(targets, key, months, field) {
    const values = months.map((mo) => amount(targets && targets.maanden[mo] && targets.maanden[mo][key] && targets.maanden[mo][key][field]));
    if (!values.length || values.includes(null)) return null;
    if (DEFS[key].kind === 'som') return values.reduce((a, b) => a + b, 0);
    return values.every((v) => v === values[0]) ? values[0] : null;
  }

  /* The target up to and including `through`: sums pro rata per day, ratios and positions in full. */
  function targetToDate(targets, key, months, through, field) {
    const passed = months.filter((mo) => mo <= through.slice(0, 7));
    if (!passed.length) return null;
    if (DEFS[key].kind !== 'som') return targetField(targets, key, passed, field);
    let total = 0;
    for (const mo of passed) {
      const full = amount(targets && targets.maanden[mo] && targets.maanden[mo][key] && targets.maanden[mo][key][field]);
      if (full === null) return null;
      total += mo < through.slice(0, 7) ? full : (full * Number(through.slice(8))) / dim(mo);
    }
    return total;
  }

  const firstTargetMonth = (targets, key, from) => Object.keys((targets && targets.maanden) || {}).sort().find((mo) => mo >= from && targets.maanden[mo][key] && amount(targets.maanden[mo][key].primair) !== null) || null;

  function status(pct) {
    return pct >= 1 ? 'groen' : pct >= 0.85 ? 'oranje' : 'rood';
  }

  /* Everything a card needs for one KPI over one period. */
  function evaluate(m, targets, key, p) {
    const d = DEFS[key];
    const now = value(m, key, p.start, p.end);
    const through = now.tot || p.end;
    const field = (f) => targetField(targets, key, p.months, f);
    const toDate = (f) => targetToDate(targets, key, p.months, through, f);
    const out = { key, ...now, target: field('primair'), vloer: field('vloer'), ambitie: field('ambitie'), targetNu: toDate('primair'), vloerNu: toDate('vloer'), pct: null, status: 'grijs', grijs: '', prognose: null, vorige: null, eersteTarget: null };
    if (out.targetNu === null) out.eersteTarget = firstTargetMonth(targets, key, p.months[0]);

    if (now.waarde === null) out.grijs = now.reden || 'Geen gegevens.';
    else if (!targets) out.grijs = 'Nog geen targets ingevoerd.';
    else if (out.targetNu === null || out.targetNu <= 0) out.grijs = 'Geen target voor deze periode.';
    else if (now.onvolledig) out.grijs = 'Onvolledige cijfers.';
    else if (!now.compleet) out.grijs = 'De meting dekt niet de hele periode.';
    else if ((key === 'verkopen' || key === 'affiliateOmzet') && now.orders < MIN_ORDERS) out.grijs = 'Minder dan ' + MIN_ORDERS + ' orders: te weinig om te beoordelen.';
    else if (d.kind === 'ratio' && now.noemer < MIN_DENOMINATOR) out.grijs = 'Minder dan ' + MIN_DENOMINATOR + ' ' + d.noemer + ': te weinig om te beoordelen.';
    if (now.waarde !== null && out.targetNu > 0) out.pct = now.waarde / out.targetNu;
    if (!out.grijs) out.status = status(out.pct);

    if (p.key === 'maand' && (key === 'googleKlikken' || key === 'bezoeken') && now.waarde !== null && now.compleet && Number(through.slice(8)) >= FORECAST_FROM_DAY) {
      out.prognose = Math.round((now.waarde / Number(through.slice(8))) * dim(through.slice(0, 7)));
    }

    /* Compare equal stretches only: sales exist per month, so only whole periods. */
    const monthly = d.source === 'verkoop' || d.source === 'gemengd';
    const before = now.waarde !== null && now.compleet && !now.onvolledig && (!monthly || p.end >= p.fullEnd) ? previous(p, through) : null;
    if (before) {
      const prev = value(m, key, before.start, before.end);
      if (prev.waarde !== null && prev.compleet && !prev.onvolledig) out.vorige = { waarde: prev.waarde, start: before.start, end: before.end };
    }
    return out;
  }

  /* The last 14 full days against the 14 before; daily sources only. */
  function trend14(m, key) {
    const source = DEFS[key].source;
    if (source !== 'sessies' && source !== 'google') return null;
    const last = m.range[source].last;
    if (!last) return null;
    const nu = value(m, key, addDays(last, -13), last);
    const ervoor = value(m, key, addDays(last, -27), addDays(last, -14));
    if (nu.waarde === null || ervoor.waarde === null || !nu.compleet || !ervoor.compleet) return null;
    return { nu: nu.waarde, ervoor: ervoor.waarde, tot: last };
  }

  const NO_CONCLUSION = 'Er is onvoldoende data beschikbaar om een betrouwbare conclusie te trekken.';

  /* Rules only: the largest shortfall and the largest overshoot among the cards that have a colour. */
  function analysis(cards) {
    const judged = cards.filter((c) => c.status !== 'grijs' && c.pct !== null);
    if (!judged.length) return { afwijking: null, positief: null, tekst: NO_CONCLUSION };
    const sorted = judged.slice().sort((a, b) => a.pct - b.pct);
    const low = sorted[0].pct < 1 ? sorted[0] : null;
    const top = sorted.at(-1);
    return { afwijking: low, positief: top.pct >= 1 ? top : null, tekst: '' };
  }

  /* Per month: the actual value and the targets, for the one growth chart. */
  function series(m, targets, key, months) {
    return months.map((mo) => {
      const [y, i] = parts(mo + '-01');
      const start = monthStart(y, i);
      const end = monthEnd(y, i);
      const v = m.tot && start <= m.tot ? value(m, key, start, minDate(end, m.tot)) : null;
      return {
        maand: mo,
        waarde: v ? v.waarde : null,
        deels: v ? v.waarde !== null && (!v.compleet || v.onvolledig || !v.tot || v.tot < end) : false,
        primair: targetField(targets, key, [mo], 'primair'),
        vloer: targetField(targets, key, [mo], 'vloer'),
        ambitie: targetField(targets, key, [mo], 'ambitie'),
      };
    });
  }

  window.JhsKpi = {
    DEFS, PRIMARY, TARGETABLE, PARTNERS, PERIODS, DAY_COLUMNS, NO_CONCLUSION, MIN_ORDERS, MIN_DENOMINATOR,
    period, previous, monthsIn, addDays, model, value, evaluate, trend14, analysis, series,
    latestTargets, newVersion, targetField, targetToDate, status,
  };
})();
