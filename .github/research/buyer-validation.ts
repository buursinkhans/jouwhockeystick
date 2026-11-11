// One-off research script (Buyer Intelligence, fase 1.5). Read-only.
// Pulls AGGREGATED counts from PostHog (EU, HogQL) and Search Console for the
// whole life of the site and prints Markdown. No visitor ids, session ids,
// heights or free text are printed: only counts per answer or per group.
// Run: node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs .github/research/buyer-validation.ts
import { createSign } from 'node:crypto';
import { SCREENS } from '../../src/content/stickwijzer/questions';

const START = '2026-08-01';
const LIVE_HOSTS = "'jouwhockeystick.nl', 'www.jouwhockeystick.nl'";
const BOT = '(?i)bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview';
const BASE = [
  `timestamp >= toDateTime('${START} 00:00:00', 'UTC')`,
  `properties.$host IN (${LIVE_HOSTS})`,
  `NOT match(coalesce(toString(properties.$raw_user_agent), ''), '${BOT}')`,
].join(' AND ');
const VD = `concat(distinct_id, '|', toString(toDate(timestamp)))`; // visitor-day

const out: string[] = [];
const p = (line = '') => out.push(line);
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((100 * a) / b)}%` : 'n.v.t.');

function table(head: string[], rows: (string | number)[][]) {
  p(`| ${head.join(' | ')} |`);
  p(`| ${head.map(() => '---').join(' | ')} |`);
  for (const r of rows) p(`| ${r.map((c) => String(c).replace(/\|/g, '/')).join(' | ')} |`);
  p();
}

// ---------- PostHog ----------
const PH_HOST = 'https://eu.posthog.com';
async function hogql(query: string): Promise<unknown[][]> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const id = process.env.POSTHOG_PROJECT_ID;
  if (!key || !id) throw new Error('PostHog-sleutel of project-id ontbreekt');
  const res = await fetch(`${PH_HOST}/api/projects/${id}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: 'buyer-validatie' }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return ((await res.json()) as { results?: unknown[][] }).results ?? [];
}

async function section(title: string, fn: () => Promise<void>) {
  p(`## ${title}`);
  p();
  try {
    await fn();
  } catch (error) {
    p(`FOUT: ${(error as Error).message}`);
    p();
  }
}

/** Per-session answers, completion and click, aggregated into a cube. */
type Cube = { dims: Record<string, string>; n: number }[];
const DIMS = [
  'advice_goal',
  'route_self_select',
  'age_band',
  'experience_seasons',
  'playing_level',
  'has_current_stick',
  'replacement_reason',
  'budget_band',
  'purchase_timing',
  'brand_loyalty',
  'feel_preference',
  'fun_style',
] as const;

async function sessionCube(): Promise<Cube> {
  const answerCols = DIMS.map(
    (d) =>
      `coalesce(nullIf(toString(argMaxIf(properties.answerKey, timestamp, event = 'question_answered' AND properties.questionId = '${d}')), ''), '(geen)') AS ${d}`,
  ).join(',\n');
  const rows = await hogql(`
    SELECT ${DIMS.join(', ')}, route, completed, matched, clicked, clicked_advice, device, count() AS n
    FROM (
      SELECT s.*,
        if(c.first_click IS NOT NULL AND c.last_click >= s.started, 'ja', 'nee') AS clicked,
        if(c.advice_clicks > 0 AND c.last_click >= s.started, 'ja', 'nee') AS clicked_advice
      FROM (
        SELECT toString(properties.adviceSessionId) AS sid,
          any(distinct_id) AS did,
          toDate(min(timestamp)) AS day,
          min(timestamp) AS started,
          coalesce(nullIf(toString(argMax(properties.route, timestamp)), ''), '(geen)') AS route,
          if(countIf(event = 'advice_completed') > 0, 'ja', 'nee') AS completed,
          if(countIf(event = 'advice_completed' AND properties.answerKey = 'match') > 0, 'ja', 'nee') AS matched,
          coalesce(nullIf(toString(any(properties.$device_type)), ''), '(onbekend)') AS device,
          ${answerCols}
        FROM events
        WHERE event IN ('advice_started', 'question_answered', 'route_selected', 'advice_completed')
          AND coalesce(toString(properties.adviceSessionId), '') != '' AND ${BASE}
        GROUP BY sid
      ) AS s
      LEFT JOIN (
        SELECT distinct_id AS cdid, toDate(timestamp) AS cday,
          min(timestamp) AS first_click, max(timestamp) AS last_click,
          countIf(properties.placement = 'stickwijzer') AS advice_clicks
        FROM events WHERE event = 'retailer_click' AND ${BASE}
        GROUP BY cdid, cday
      ) AS c ON s.did = c.cdid AND s.day = c.cday
    )
    GROUP BY ${DIMS.join(', ')}, route, completed, matched, clicked, clicked_advice, device
    LIMIT 50000`);
  const names = [...DIMS, 'route', 'completed', 'matched', 'clicked', 'clicked_advice', 'device'];
  return rows.map((r) => {
    const dims: Record<string, string> = {};
    names.forEach((name, i) => (dims[name] = String(r[i] ?? '')));
    return { dims, n: num(r[names.length]) };
  });
}

function crosstab(cube: Cube, rowDim: string, colDim: string, filter?: (d: Record<string, string>) => boolean) {
  const rows = new Map<string, Map<string, number>>();
  const cols = new Set<string>();
  for (const { dims, n } of cube) {
    if (filter && !filter(dims)) continue;
    const r = dims[rowDim] ?? '';
    const c = dims[colDim] ?? '';
    cols.add(c);
    const m = rows.get(r) ?? new Map<string, number>();
    m.set(c, (m.get(c) ?? 0) + n);
    rows.set(r, m);
  }
  const colList = [...cols].sort();
  const body = [...rows.entries()]
    .map(([r, m]) => {
      const total = [...m.values()].reduce((a, b) => a + b, 0);
      return { r, total, cells: colList.map((c) => m.get(c) ?? 0) };
    })
    .sort((a, b) => b.total - a.total);
  table(
    [`${rowDim} \\ ${colDim}`, 'totaal', ...colList.map((c) => `${c} (n, % van rij)`)],
    body.map(({ r, total, cells }) => [r, total, ...cells.map((v) => `${v} (${pct(v, total)})`)]),
  );
}

async function posthog() {
  await section('PostHog: totalen per maand', async () => {
    const rows = await hogql(`
      SELECT toStartOfMonth(timestamp) AS m,
        uniqIf(${VD}, event = '$pageview') AS bezoekdagen,
        uniqIf(properties.adviceSessionId, event = 'advice_started') AS wijzer_gestart,
        uniqIf(properties.adviceSessionId, event = 'advice_completed') AS wijzer_afgerond,
        countIf(event = 'retailer_click') AS winkelkliks,
        uniqIf(${VD}, event = 'retailer_click') AS klikkers,
        countIf(event = 'stickwijzer_exit' AND properties.target = 'zaal') AS exit_zaal,
        countIf(event = 'stickwijzer_exit' AND properties.target = 'keeper') AS exit_keeper,
        countIf(event = 'quiz_start' AND properties.quiz = 'schoen') AS schoenwijzer_start,
        countIf(event = 'interest_submit') AS interesse,
        countIf(event = 'indoor_selection') AS zaalfinder_keuzes
      FROM events WHERE ${BASE} GROUP BY m ORDER BY m`);
    table(
      ['maand', 'bezoekdagen', 'wijzer gestart', 'wijzer afgerond', 'winkelkliks', 'klikkers (bezoekdagen)', 'uitgang zaal', 'uitgang keeper', 'schoenwijzer start', 'interesseformulier', 'zaalfinder-keuzes'],
      rows.map((r) => [String(r[0]).slice(0, 7), ...r.slice(1).map(num)]),
    );
  });

  await section('PostHog: antwoordverdeling per vraag (unieke wijzersessies)', async () => {
    const rows = await hogql(`
      SELECT toString(properties.questionId) AS q, toString(properties.answerKey) AS a,
        uniq(properties.adviceSessionId) AS n
      FROM events WHERE event = 'question_answered' AND ${BASE}
      GROUP BY q, a ORDER BY q, n DESC LIMIT 2000`);
    const byQ = new Map<string, [string, number][]>();
    for (const r of rows) {
      const q = String(r[0]);
      const list = byQ.get(q) ?? [];
      list.push([String(r[1] ?? ''), num(r[2])]);
      byQ.set(q, list);
    }
    for (const [q, list] of byQ) {
      const total = list.reduce((a, [, n]) => a + n, 0);
      p(`### ${q} (n = ${total})`);
      p();
      // Multi-select answers (a+b) are split so each option counts once per session.
      const split = new Map<string, number>();
      for (const [a, n] of list) for (const part of a.split('+')) split.set(part, (split.get(part) ?? 0) + n);
      table(
        ['antwoord', 'sessies', '% van sessies met deze vraag'],
        [...split.entries()].sort((x, y) => y[1] - x[1]).map(([a, n]) => [a || '(leeg)', n, pct(n, total)]),
      );
    }
  });

  await section('PostHog: afhaken per scherm (sessies die het scherm met Volgende verlieten)', async () => {
    const rows = await hogql(`
      SELECT coalesce(toString(properties.route), '(geen)') AS route, toString(properties.questionId) AS q,
        uniq(properties.adviceSessionId) AS n
      FROM events WHERE event = 'question_answered' AND ${BASE}
      GROUP BY route, q LIMIT 2000`);
    const started = await hogql(`
      SELECT r, count() AS n, countIf(done) AS afgerond
      FROM (SELECT toString(properties.adviceSessionId) AS sid,
              coalesce(nullIf(toString(argMax(properties.route, timestamp)), ''), '(geen)') AS r,
              countIf(event = 'advice_completed') > 0 AS done
            FROM events WHERE event IN ('advice_started','route_selected','question_answered','advice_completed') AND ${BASE}
              AND coalesce(toString(properties.adviceSessionId), '') != ''
            GROUP BY sid)
      GROUP BY r ORDER BY n DESC`);
    p('Sessies per laatst bekende route (gestart / afgerond):');
    p();
    table(['route', 'sessies', 'afgerond'], started.map((r) => [String(r[0]), num(r[1]), num(r[2])]));
    const count = new Map<string, number>();
    for (const r of rows) count.set(`${r[0]}|${r[1]}`, num(r[2]));
    for (const [route, screens] of Object.entries(SCREENS)) {
      p(`### Route ${route}`);
      p();
      table(
        ['scherm', 'eerste vraag', 'sessies'],
        screens.map((s) => [s.id, s.questions[0] ?? '', count.get(`${route}|${s.questions[0]}`) ?? 0]),
      );
    }
  });

  let cube: Cube = [];
  await section('PostHog: sessiekubus (voor kruistabellen)', async () => {
    cube = await sessionCube();
    const total = cube.reduce((a, c) => a + c.n, 0);
    p(`Wijzersessies in de kubus: ${total}.`);
    p();
  });
  if (cube.length) {
    const tabs: [string, string, string, ((d: Record<string, string>) => boolean)?][] = [
      ['Voor wie × afgerond', 'advice_goal', 'completed'],
      ['Voor wie × winkelklik (zelfde bezoekdag, na start)', 'advice_goal', 'clicked'],
      ['Voor wie × leeftijd', 'advice_goal', 'age_band'],
      ['Voor wie × seizoenen', 'advice_goal', 'experience_seasons'],
      ['Voor wie × budget', 'advice_goal', 'budget_band'],
      ['Voor wie × huidige stick', 'advice_goal', 'has_current_stick'],
      ['Voor wie × reden nieuwe stick', 'advice_goal', 'replacement_reason'],
      ['Voor wie × route', 'advice_goal', 'route_self_select'],
      ['Leeftijd × seizoenen', 'age_band', 'experience_seasons'],
      ['Leeftijd × budget', 'age_band', 'budget_band'],
      ['Leeftijd × reden nieuwe stick', 'age_band', 'replacement_reason'],
      ['Leeftijd × huidige stick', 'age_band', 'has_current_stick'],
      ['Budget × winkelklik', 'budget_band', 'clicked'],
      ['Budget × winkelklik vanuit advies', 'budget_band', 'clicked_advice'],
      ['Leeftijd × winkelklik', 'age_band', 'clicked'],
      ['Seizoenen × winkelklik', 'experience_seasons', 'clicked'],
      ['Reden × winkelklik', 'replacement_reason', 'clicked'],
      ['Huidige stick × winkelklik', 'has_current_stick', 'clicked'],
      ['Koopmoment (timing) × winkelklik', 'purchase_timing', 'clicked'],
      ['Route (keuze) × winkelklik', 'route_self_select', 'clicked'],
      ['Afgerond × winkelklik', 'completed', 'clicked'],
      ['Afgerond met match × winkelklik', 'matched', 'clicked'],
      ['Apparaat × afgerond', 'device', 'completed'],
      ['Apparaat × winkelklik', 'device', 'clicked'],
      ['Speelniveau × winkelklik', 'playing_level', 'clicked'],
      ['Merktrouw × winkelklik', 'brand_loyalty', 'clicked'],
      ['Leeftijd × afgerond', 'age_band', 'completed'],
      ['Budget × afgerond', 'budget_band', 'completed'],
      ['Leeftijd 18+ × seizoenen (volwassenen)', 'experience_seasons', 'advice_goal', (d) => d.age_band === '18_plus'],
    ];
    for (const [title, r, c, f] of tabs) {
      p(`### ${title}`);
      p();
      crosstab(cube, r, c, f);
    }
  }

  await section('PostHog: uitkomst, rollen, feedback', async () => {
    const q = async (event: string, key: string, unit = 'count()') =>
      hogql(`SELECT toString(${key}) AS k, ${unit} AS n FROM events WHERE event = '${event}' AND ${BASE} GROUP BY k ORDER BY n DESC LIMIT 50`);
    for (const [label, event, key] of [
      ['advice_completed (uitkomst)', 'advice_completed', 'properties.answerKey'],
      ['advice_product_viewed (rol)', 'advice_product_viewed', 'properties.answerKey'],
      ['advice_feedback_submitted', 'advice_feedback_submitted', 'properties.answerKey'],
      ['advice_compare_click (paar)', 'advice_compare_click', 'properties.pair'],
      ['advice_shared', 'advice_shared', 'properties.method'],
      ['retailer_click per plek', 'retailer_click', 'properties.placement'],
      ['retailer_click per linktype', 'retailer_click', 'properties.linkType'],
      ['retailer_click per positie in Waar te koop', 'retailer_click', 'properties.position'],
      ['retailer_click per winkel', 'retailer_click', 'properties.retailer'],
      ['retailer_click per merk', 'retailer_click', 'properties.brand'],
      ['interest_submit per bron', 'interest_submit', 'properties.source'],
      ['zaalfinder: speler', 'indoor_selection', 'properties.player'],
      ['zaalfinder: budget', 'indoor_selection', 'properties.budget'],
      ['zaalfinder: maten', 'indoor_selection', 'properties.sizes'],
      ['zaalfinder: eerste antwoord', 'indoor_finder_start', 'properties.first'],
      ['home_block_click', 'home_block_click', "concat(toString(properties.block), ' > ', toString(properties.target))"],
      ['optional_questions_open per scherm', 'optional_questions_open', 'properties.screen'],
    ] as const) {
      const rows = await q(event, key);
      p(`### ${label}`);
      p();
      table(['waarde', 'aantal'], rows.map((r) => [String(r[0] ?? ''), num(r[1])]));
    }
  });

  await section('PostHog: pagina\'s, landingspagina\'s en bronnen (bezoekdagen)', async () => {
    const pages = await hogql(`
      SELECT toString(properties.$pathname) AS path, uniq(${VD}) AS n
      FROM events WHERE event = '$pageview' AND ${BASE} GROUP BY path ORDER BY n DESC LIMIT 60`);
    p('### Bekeken pagina\'s');
    p();
    table(['pagina', 'bezoekdagen'], pages.map((r) => [String(r[0]), num(r[1])]));

    const landing = await hogql(`
      SELECT land, bron, count() AS bezoeken, countIf(s > 0) AS wijzer_start, countIf(c > 0) AS wijzer_af, countIf(k > 0) AS winkelklik
      FROM (
        SELECT distinct_id, toDate(timestamp) AS day,
          argMinIf(toString(properties.$pathname), timestamp, event = '$pageview') AS land,
          argMinIf(multiIf(
            lower(coalesce(toString(properties.utm_source), '')) != '', concat('utm:', lower(toString(properties.utm_source))),
            coalesce(toString(properties.$referring_domain), '') IN ('', '$direct'), 'direct',
            match(toString(properties.$referring_domain), 'google'), 'google',
            match(toString(properties.$referring_domain), 'bing|duckduckgo|ecosia|yahoo'), 'andere zoekmachine',
            match(toString(properties.$referring_domain), 'chatgpt|openai|perplexity|gemini|copilot|claude'), 'ai-assistent',
            match(toString(properties.$referring_domain), 'instagram|facebook|fb\\\\.|whatsapp|pinterest|t\\\\.co|linkedin'), 'social/messaging',
            match(toString(properties.$referring_domain), 'jouwhockeystick'), 'intern',
            'overige site'), timestamp, event = '$pageview') AS bron,
          countIf(event = 'advice_started') AS s, countIf(event = 'advice_completed') AS c, countIf(event = 'retailer_click') AS k
        FROM events WHERE ${BASE} GROUP BY distinct_id, day
        HAVING land != ''
      )
      GROUP BY land, bron ORDER BY bezoeken DESC LIMIT 300`);
    const byLand = new Map<string, number[]>();
    const bySrc = new Map<string, number[]>();
    for (const r of landing) {
      const vals = [num(r[2]), num(r[3]), num(r[4]), num(r[5])];
      for (const [map, key] of [[byLand, String(r[0])], [bySrc, String(r[1])]] as const) {
        const cur = map.get(key) ?? [0, 0, 0, 0];
        map.set(key, cur.map((v, i) => v + (vals[i] ?? 0)));
      }
    }
    const fmt = (m: Map<string, number[]>, label: string) =>
      table(
        [label, 'bezoeken', 'wijzer gestart', 'wijzer afgerond', 'met winkelklik'],
        [...m.entries()].sort((a, b) => (b[1][0] ?? 0) - (a[1][0] ?? 0)).slice(0, 40)
          .map(([k, v]) => [k, v[0] ?? 0, `${v[1]} (${pct(v[1] ?? 0, v[0] ?? 0)})`, `${v[2]} (${pct(v[2] ?? 0, v[0] ?? 0)})`, `${v[3]} (${pct(v[3] ?? 0, v[0] ?? 0)})`]),
      );
    p('### Per bron (bron van de eerste pageview van de bezoekdag)');
    p();
    fmt(bySrc, 'bron');
    p('### Per landingspagina');
    p();
    fmt(byLand, 'landingspagina');

    const devices = await hogql(`
      SELECT coalesce(toString(properties.$device_type), '(onbekend)') AS d, uniq(${VD}) AS n
      FROM events WHERE event = '$pageview' AND ${BASE} GROUP BY d ORDER BY n DESC`);
    p('### Apparaat (bezoekdagen)');
    p();
    table(['apparaat', 'bezoekdagen'], devices.map((r) => [String(r[0]), num(r[1])]));
  });
}

// ---------- Search Console ----------
async function gscToken(): Promise<string> {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON ontbreekt');
  const acc = JSON.parse(raw) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const b64 = (v: string) => Buffer.from(v).toString('base64url');
  const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64(JSON.stringify({ iss: acc.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(acc.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claims}.${sig}` }),
  });
  if (!res.ok) throw new Error(`Google-login HTTP ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function searchConsole() {
  await section('Search Console: hele looptijd', async () => {
    const token = await gscToken();
    const end = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);
    const sites = process.env.GSC_SITE_URL ? [process.env.GSC_SITE_URL] : ['sc-domain:jouwhockeystick.nl', 'https://jouwhockeystick.nl/'];
    for (const site of sites) {
      const run = async (dimensions: string[], rowLimit = 25000) => {
        const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: START, endDate: end, dimensions, rowLimit }),
        });
        if (!res.ok) throw new Error(`${site}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
        return ((await res.json()) as { rows?: { keys: string[]; clicks: number; impressions: number; position: number }[] }).rows ?? [];
      };
      let queries;
      try {
        queries = await run(['query']);
      } catch (error) {
        p(`(${(error as Error).message})`);
        continue;
      }
      p(`Site ${site}, ${START} t/m ${end}. Zoektermen met data: ${queries.length} (Google laat zeldzame termen weg).`);
      p();
      const totals = (await run(['date'])).reduce((a, r) => [a[0] + r.clicks, a[1] + r.impressions], [0, 0]);
      p(`Totaal: ${totals[0]} klikken, ${totals[1]} vertoningen.`);
      p();
      p('### Zoektermen (top 250 op vertoningen)');
      p();
      table(['zoekterm', 'klikken', 'vertoningen', 'positie'],
        queries.sort((a, b) => b.impressions - a.impressions).slice(0, 250)
          .map((r) => [r.keys[0] ?? '', r.clicks, r.impressions, r.position.toFixed(1)]));
      for (const [label, dim] of [['Pagina\'s', 'page'], ['Apparaat', 'device'], ['Land', 'country']] as const) {
        const rows = await run([dim]);
        p(`### ${label}`);
        p();
        table([dim, 'klikken', 'vertoningen', 'positie'],
          rows.sort((a, b) => b.impressions - a.impressions).slice(0, 60)
            .map((r) => [r.keys[0] ?? '', r.clicks, r.impressions, r.position.toFixed(1)]));
      }
      const monthly = new Map<string, number[]>();
      for (const r of await run(['date'])) {
        const m = (r.keys[0] ?? '').slice(0, 7);
        const cur = monthly.get(m) ?? [0, 0];
        monthly.set(m, [(cur[0] ?? 0) + r.clicks, (cur[1] ?? 0) + r.impressions]);
      }
      p('### Per maand');
      p();
      table(['maand', 'klikken', 'vertoningen'], [...monthly.entries()].map(([m, v]) => [m, v[0] ?? 0, v[1] ?? 0]));
      break;
    }
  });
}

p('# Buyer Intelligence fase 1.5: ruwe meetdata (alleen tellingen)');
p();
p(`Opgehaald op ${new Date().toISOString().slice(0, 16)} UTC. Periode vanaf ${START}. Alleen live domein, bots eruit gefilterd. "Bezoekdag" = één bezoeker op één dag (PostHog draait cookieloos). "Winkelklik" bij een wijzersessie = een retailer_click van dezelfde bezoeker op dezelfde dag, na de start van de wijzer.`);
p();
await posthog();
await searchConsole();
console.log(out.join('\n'));
