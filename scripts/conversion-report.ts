// Weekly conversion report (read-only). Queries PostHog (EU) with HogQL for
// the last 7 full days and the 7 before, and prints a Markdown report.
// Needs a personal API key with only the "Query Read" permission
// (POSTHOG_PERSONAL_API_KEY, GitHub Secret) and the project id
// (POSTHOG_PROJECT_ID, repository variable).
// Run with: npm run analytics:report
import { QUESTION_META, type QuestionId } from '../src/advice-engine/answers';
import { QUESTIONS, SCREENS } from '../src/content/stickwijzer/questions';
import { POSTHOG_UI_HOST } from '../src/lib/analytics/posthog';
import {
  AI_REFERRER_DOMAINS,
  AI_UTM_SOURCES,
  formatReport,
  type ConversionData,
  type Count,
  type Period,
  type ScreenStep,
} from '../src/analytics-report/conversion';

const DAY = 86_400_000;
const LIVE_HOSTS = ['jouwhockeystick.nl', 'www.jouwhockeystick.nl'];
const BOT_PATTERN = '(?i)bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview';

function readConfig(): { key: string; projectId: string } {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!key) throw new Error('POSTHOG_PERSONAL_API_KEY ontbreekt (GitHub Secrets).');
  if (!projectId || !/^\d+$/.test(projectId)) {
    throw new Error('POSTHOG_PROJECT_ID ontbreekt of is geen getal (GitHub-variabele).');
  }
  return { key, projectId };
}

const isoDate = (time: number) => new Date(time).toISOString().slice(0, 10);
const literal = (time: number) =>
  `toDateTime('${new Date(time).toISOString().slice(0, 19).replace('T', ' ')}', 'UTC')`;

// Whole UTC days: [prevStart, curStart) is last week, [curStart, end) this week.
const end = Math.floor(Date.now() / DAY) * DAY;
const curStart = end - 7 * DAY;
const prevStart = end - 14 * DAY;
const current: Period = { start: isoDate(curStart), end: isoDate(end - DAY) };
const previous: Period = { start: isoDate(prevStart), end: isoDate(curStart - DAY) };

const hosts = LIVE_HOSTS.map((host) => `'${host}'`).join(', ');
const BASE_FILTER = [
  `timestamp >= ${literal(prevStart)}`,
  `timestamp < ${literal(end)}`,
  `properties.$host IN (${hosts})`,
  `NOT match(coalesce(toString(properties.$raw_user_agent), ''), '${BOT_PATTERN}')`,
].join(' AND ');
const IS_NOW = `timestamp >= ${literal(curStart)}`;

async function hogql(config: { key: string; projectId: string }, query: string): Promise<unknown[][]> {
  const response = await fetch(`${POSTHOG_UI_HOST}/api/projects/${config.projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: 'conversie-rapport' }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `PostHog weigert de sleutel (HTTP ${response.status}). Controleer of de personal API key de rechten "Query Read" heeft en bij dit project hoort. ${detail}`,
      );
    }
    throw new Error(`PostHog-query mislukt (HTTP ${response.status}): ${detail}`);
  }
  const body = (await response.json()) as { results?: unknown[][] };
  return body.results ?? [];
}

const num = (value: unknown) => (typeof value === 'number' ? value : Number(value) || 0);

/** Counts per breakdown value; `visitors` counts visitor-days instead of events. */
async function breakdown(
  config: { key: string; projectId: string },
  event: string,
  keyExpression: string,
  unit: 'events' | 'visitors' = 'events',
): Promise<Count[]> {
  const visitorDay = `concat(distinct_id, '|', toString(toDate(timestamp)))`;
  const [nowExpr, beforeExpr] =
    unit === 'events'
      ? [`countIf(${IS_NOW})`, `countIf(NOT (${IS_NOW}))`]
      : [`uniqIf(${visitorDay}, ${IS_NOW})`, `uniqIf(${visitorDay}, NOT (${IS_NOW}))`];
  const rows = await hogql(
    config,
    `SELECT toString(${keyExpression}) AS k, ${nowExpr} AS now, ${beforeExpr} AS before
     FROM events WHERE event = '${event}' AND ${BASE_FILTER}
     GROUP BY k ORDER BY now DESC LIMIT 100`,
  );
  return rows.map(([key, now, before]) => ({
    key: typeof key === 'string' ? key : '',
    now: num(now),
    before: num(before),
  }));
}

async function funnel(config: { key: string; projectId: string }): Promise<Count[]> {
  const steps = ['visitors', 'started', 'route', 'completed', 'clicked', 'clickers'];
  const conditions = [
    'pv > 0 OR s > 0 OR k > 0',
    's > 0',
    's > 0 AND r > 0',
    's > 0 AND c > 0',
    's > 0 AND c > 0 AND k > 0 AND lastClick >= firstAdvice',
    'k > 0',
  ];
  const columns = conditions.flatMap((condition) => [
    `countIf(isNow AND (${condition}))`,
    `countIf(NOT isNow AND (${condition}))`,
  ]);
  const rows = await hogql(
    config,
    `SELECT ${columns.join(', ')} FROM (
       SELECT distinct_id, toDate(timestamp) AS day, max(${IS_NOW}) AS isNow,
         countIf(event = '$pageview') AS pv,
         countIf(event = 'advice_started') AS s,
         countIf(event = 'route_selected') AS r,
         countIf(event = 'advice_completed') AS c,
         countIf(event = 'retailer_click') AS k,
         minIf(timestamp, event = 'advice_completed') AS firstAdvice,
         maxIf(timestamp, event = 'retailer_click') AS lastClick
       FROM events WHERE ${BASE_FILTER}
       GROUP BY distinct_id, day
     )`,
  );
  const row = rows[0] ?? [];
  return steps.map((key, index) => ({
    key,
    now: num(row[index * 2]),
    before: num(row[index * 2 + 1]),
  }));
}

/** A quoted HogQL string list of exact values, lower case: 'a', 'b'. */
const sqlList = (values: readonly string[]) => values.map((v) => `'${v.toLowerCase().replace(/'/g, '')}'`).join(', ');

/**
 * Visits from an AI assistant per "source → landing path" (decision log
 * 2026-10-28). A visit is one visitor on one day (cookieless: no session
 * ids). Its landing page, utm_source and referring domain all come from the
 * day's FIRST pageview: argMin over a tuple, because argMin over a nullable
 * column would skip empty values and take them from a later pageview. Only
 * exact AI values count (AI_UTM_SOURCES, AI_REFERRER_DOMAINS); each visit
 * yields one row, so nothing is counted twice.
 */
async function aiVisits(config: { key: string; projectId: string }): Promise<Count[]> {
  const utm = sqlList(Object.keys(AI_UTM_SOURCES));
  const domains = sqlList(Object.keys(AI_REFERRER_DOMAINS));
  const rows = await hogql(
    config,
    `SELECT k, countIf(isNow) AS now, countIf(NOT isNow) AS before FROM (
       SELECT
         if(utm IN (${utm}), concat('utm:', utm), ref) AS source,
         concat(source, ' → ', path) AS k,
         isNow, utm, ref
       FROM (
         SELECT distinct_id, toDate(timestamp) AS day, max(${IS_NOW}) AS isNow,
           argMin(tuple(
             lower(coalesce(toString(properties.utm_source), '')),
             lower(coalesce(toString(properties.$referring_domain), '')),
             coalesce(toString(properties.$pathname), '/')
           ), timestamp) AS first,
           tupleElement(first, 1) AS utm,
           tupleElement(first, 2) AS ref,
           tupleElement(first, 3) AS path
         FROM events WHERE event = '$pageview' AND ${BASE_FILTER}
         GROUP BY distinct_id, day
       )
       WHERE utm IN (${utm}) OR ref IN (${domains})
     )
     GROUP BY k ORDER BY now DESC LIMIT 200`,
  );
  return rows.map(([key, now, before]) => ({
    key: typeof key === 'string' ? key : '',
    now: num(now),
    before: num(before),
  }));
}

async function otherHostEvents(config: { key: string; projectId: string }): Promise<number> {
  const rows = await hogql(
    config,
    `SELECT count() FROM events
     WHERE ${IS_NOW} AND timestamp < ${literal(end)}
       AND coalesce(toString(properties.$host), '') NOT IN (${hosts})`,
  );
  return num(rows[0]?.[0]);
}

/**
 * Required questions asked in every route, in the order of the START flow.
 * Questions that only show after a certain answer (`showWhen`) are left out:
 * fewer answers there are not drop-off.
 */
function commonStepOrder(): QuestionId[] {
  const order: QuestionId[] = [];
  for (const screen of SCREENS.START) {
    for (const id of screen.order ?? [...screen.questions, ...(screen.optional ?? [])]) {
      const meta = QUESTION_META[id];
      const always = QUESTIONS[id].showWhen === undefined;
      if (meta.required && meta.routes.length === 3 && always && !order.includes(id)) order.push(id);
    }
  }
  return order;
}

/**
 * Per route, the screens after the route choice, each recognised by its first
 * required question that is always asked (not one that depends on an answer).
 */
function routeScreenSteps(): Record<string, ScreenStep[]> {
  const result: Record<string, ScreenStep[]> = {};
  for (const [route, screens] of Object.entries(SCREENS)) {
    result[route] = screens.slice(1).flatMap((screen) => {
      const questionId = screen.questions.find((id) => QUESTIONS[id].showWhen === undefined);
      return questionId ? [{ title: screen.title, questionId }] : [];
    });
  }
  return result;
}

// TIJDELIJK (validatie PR #116): wordt vóór de merge weer verwijderd.
async function validateOnly(config: { key: string; projectId: string }) {
  console.log('## 1. AI-bezoeken (de query uit het rapport)');
  console.log(JSON.stringify(await aiVisits(config)));
  console.log('## 2. Zelfde opbouw zonder AI-filter: top 10 bron → landingspagina per bezoek (structuurcontrole)');
  const rows = await hogql(
    config,
    `SELECT k, count() AS visits FROM (
       SELECT concat(if(utm != '', concat('utm:', utm), ref), ' → ', path) AS k FROM (
         SELECT distinct_id, toDate(timestamp) AS day,
           argMin(tuple(lower(coalesce(toString(properties.utm_source), '')), lower(coalesce(toString(properties.$referring_domain), '')), coalesce(toString(properties.$pathname), '/')), timestamp) AS first,
           tupleElement(first, 1) AS utm, tupleElement(first, 2) AS ref, tupleElement(first, 3) AS path
         FROM events WHERE event = '$pageview' AND ${BASE_FILTER}
         GROUP BY distinct_id, day))
     GROUP BY k ORDER BY visits DESC LIMIT 10`,
  );
  console.log(JSON.stringify(rows));
  console.log('## 3. Bezoeken vs pageviews (dubbeltelling per pageview zichtbaar maken)');
  console.log(JSON.stringify(await hogql(config, `SELECT count() AS pageviews, uniq(concat(distinct_id, '|', toString(toDate(timestamp)))) AS visits FROM events WHERE event = '$pageview' AND ${BASE_FILTER}`)));
  console.log('## 5. AI-query met vandaag erbij (eindcontrole met het testbezoek via utm_source=chatgpt.com)');
  const utm = sqlList(Object.keys(AI_UTM_SOURCES));
  const domains = sqlList(Object.keys(AI_REFERRER_DOMAINS));
  console.log(JSON.stringify(await hogql(
    config,
    `SELECT if(utm IN (${utm}), concat('utm:', utm), ref) AS source, path, count() AS visits FROM (
       SELECT distinct_id, toDate(timestamp) AS day,
         argMin(tuple(lower(coalesce(toString(properties.utm_source), '')), lower(coalesce(toString(properties.$referring_domain), '')), coalesce(toString(properties.$pathname), '/')), timestamp) AS first,
         tupleElement(first, 1) AS utm, tupleElement(first, 2) AS ref, tupleElement(first, 3) AS path
       FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('2026-10-28 00:00:00', 'UTC') AND properties.$host IN (${hosts})
       GROUP BY distinct_id, day)
     WHERE utm IN (${utm}) OR ref IN (${domains})
     GROUP BY source, path`,
  )));
  console.log('## 4. Events per dag (UTC) sinds 2026-10-25, alle hosts en de live host');
  console.log(JSON.stringify(await hogql(
    config,
    `SELECT toDate(timestamp) AS day, countIf(properties.$host IN (${hosts})) AS live, count() AS alle,
       countIf(event = '$pageview' AND properties.$host IN (${hosts})) AS pageviews_live,
       min(timestamp) AS eerste, max(timestamp) AS laatste
     FROM events WHERE timestamp >= toDateTime('2026-10-25 00:00:00', 'UTC') GROUP BY day ORDER BY day`,
  )));
}

async function main() {
  const config = readConfig();
  if (process.env.VALIDATE_ONLY === '1') return validateOnly(config);
  // Sequential on purpose: PostHog allows only a few concurrent queries.
  const data: ConversionData = {
    current,
    previous,
    events: [
      ...(await breakdown(config, '$pageview', `'$pageview'`)),
      ...(await breakdown(config, 'retailer_click', `'retailer_click'`)),
    ],
    funnel: await funnel(config),
    questions: await breakdown(config, 'question_answered', 'properties.questionId', 'visitors'),
    questionsByRoute: await breakdown(
      config,
      'question_answered',
      `concat(toString(properties.route), '|', toString(properties.questionId))`,
      'visitors',
    ),
    adviceByRoute: await breakdown(config, 'advice_completed', 'properties.route', 'visitors'),
    adviceOutcomes: await breakdown(config, 'advice_completed', 'properties.answerKey'),
    feedback: await breakdown(config, 'advice_feedback_submitted', 'properties.answerKey'),
    clicksByPlacement: await breakdown(config, 'retailer_click', 'properties.placement'),
    clicksByLinkType: await breakdown(config, 'retailer_click', 'properties.linkType'),
    clicksByRetailer: await breakdown(config, 'retailer_click', 'properties.retailer'),
    clicksByProduct: await breakdown(
      config,
      'retailer_click',
      // Most product names already start with the brand ("Grays Grays JB 10").
      `if(startsWith(toString(properties.productName), toString(properties.brand)), toString(properties.productName), concat(toString(properties.brand), ' ', toString(properties.productName)))`,
    ),
    clicksByPage: await breakdown(config, 'retailer_click', 'properties.$pathname'),
    pageviewsByPage: await breakdown(config, '$pageview', 'properties.$pathname'),
    // Grouped into channels in the report (sourceLabel). Optional, like the dead-click elements.
    visitorsByReferrer: await breakdown(
      config,
      '$pageview',
      `if(coalesce(toString(properties.utm_source), '') != '', concat('utm:', toString(properties.utm_source)), coalesce(toString(properties.$referring_domain), '$direct'))`,
      'visitors',
    ).catch(() => []),
    // Landing pages of visitors from an AI assistant ("source → path"); the report keeps only AI sources.
    aiLandingPages: await aiVisits(config).catch((error: unknown) => {
      console.error(`AI-bezoeken overgeslagen: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }),
    homeBlocks: await breakdown(
      config,
      'home_block_click',
      `concat(toString(properties.block), ' → ', toString(properties.target))`,
    ),
    deadClicksByPage: await breakdown(config, '$dead_click', 'properties.$pathname'),
    // Tag and text of the clicked element. Optional: an empty table when PostHog cannot answer.
    deadClicksByElement: await breakdown(
      config,
      '$dead_click',
      // elements_chain starts with the clicked element: its tag, then its attributes (text="…").
      `concat(toString(properties.$pathname), ' · ', extract(elements_chain, '^([a-zA-Z0-9-]+)'), ' · "', substring(extract(elements_chain, '^[^;]*?text="([^"]*)"'), 1, 40), '"')`,
    ).catch((error: unknown) => {
      console.error(`Dead clicks per element overgeslagen: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }),
    rageClicksByPage: await breakdown(config, '$rageclick', 'properties.$pathname'),
    otherHostEvents: await otherHostEvents(config),
  };
  console.log(formatReport(data, commonStepOrder(), routeScreenSteps()));
}

main().catch((error: unknown) => {
  console.log(`# Conversie-rapport mislukt\n\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
