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
  formatReport,
  type ConversionData,
  type Count,
  type Period,
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

async function main() {
  const config = readConfig();
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
    adviceOutcomes: await breakdown(config, 'advice_completed', 'properties.answerKey'),
    feedback: await breakdown(config, 'advice_feedback_submitted', 'properties.answerKey'),
    clicksByPlacement: await breakdown(config, 'retailer_click', 'properties.placement'),
    clicksByLinkType: await breakdown(config, 'retailer_click', 'properties.linkType'),
    clicksByProduct: await breakdown(
      config,
      'retailer_click',
      `concat(toString(properties.brand), ' ', toString(properties.productName))`,
    ),
    clicksByPage: await breakdown(config, 'retailer_click', 'properties.$pathname'),
    pageviewsByPage: await breakdown(config, '$pageview', 'properties.$pathname'),
    homeBlocks: await breakdown(
      config,
      'home_block_click',
      `concat(toString(properties.block), ' → ', toString(properties.target))`,
    ),
    deadClicksByPage: await breakdown(config, '$dead_click', 'properties.$pathname'),
    rageClicksByPage: await breakdown(config, '$rageclick', 'properties.$pathname'),
    otherHostEvents: await otherHostEvents(config),
  };
  console.log(formatReport(data, commonStepOrder()));
}

main().catch((error: unknown) => {
  console.log(`# Conversie-rapport mislukt\n\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
