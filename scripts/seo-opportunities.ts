// Monthly SEO opportunity report (read-only for the site). Fetches Search Console
// rows for the Netherlands (query x page: the last 28 processed days, the 28
// before, and about 90 days), looks up what the site offers for each query, and
// writes ONE sealed file (VERKOOP_SLEUTEL) that the Marketingstudio opens in the
// owner's browser. Then it measures the recommendations that the owner marked as
// done 28 days ago, and creates one issue without figures per new recommendation.
// Design: docs/seo-market-intelligence-plan.md.
//
// The repository and its workflow logs are public, so this script prints one
// status line without any figure, query or page (statusLine), plus fixed
// sentences. It never prints an HTTP body, a row or an error detail.
//
// Usage: npm run seo:opportunities -- <out.json> [previous-seo.json]
// Environment: GSC_SERVICE_ACCOUNT_JSON, VERKOOP_SLEUTEL; optional GSC_SITE_URL,
// GITHUB_TOKEN and GITHUB_REPOSITORY (statuses and issues), SEO_ISSUES=uit (no issues).
// Exit code 0: written. 1: failed (nothing written). 3: VERKOOP_SLEUTEL is missing
// (nothing written, so no readable figure ever reaches the public branch).
import { readFileSync, writeFileSync } from 'node:fs';
import { buildSearchIndex } from '../src/search/buildIndex';
import type { SearchConfig } from '../src/search/config';
import { prepareIndex, search } from '../src/search/engine';
import { DAY_MS, isoDay, lastReportedDay } from '../src/marketing/dailyMetrics';
import { seal, unseal, type Sealed } from '../src/marketing/seal';
import {
  analyse,
  categoryPathOf,
  SEO_RULESET_VERSION,
  SeoReport,
  statusLine,
  type HistoryMonth,
  type LinkLookup,
  type OfferMatch,
} from '../src/seo/opportunities';
import { hasContentLink } from '../src/seo/links';
import {
  applyOutcomes,
  dueForEvaluation,
  idFromBody,
  LABELS,
  outcomeOf,
  statusesFromIssues,
  type Due,
  type Figures,
  type IssueLike,
  type RecStatus,
} from '../src/seo/evaluate';
import { issueFor, outcomeComment, socialIssueFor, withIssueNumbers } from '../src/seo/issues';
import { getToken, readServiceAccount } from '../src/seo/googleAuth';
import { BOT_PATTERN, hogql, LIVE_HOSTS, readPosthogConfig } from '../src/analytics-report/hogql';
import { funnelFromRows, funnelQuery, type Funnel, type FunnelFigures } from '../src/seo/funnel';
import { GENERIC_WORDS } from '../src/seo/seoConfig';
import { seasonFromExports } from '../src/seo/trends';
import { readTrendExports } from '../src/seo/trendsFiles';
import type { Period, SearchRow } from '../src/seo/searchConsole';

const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const SITES = ['sc-domain:jouwhockeystick.nl', 'https://jouwhockeystick.nl/'];
/** Search Console data lags about two to three days. */
const LAG_DAYS = 3;
const PERIOD_DAYS = 28;
const LONG_DAYS = 90;
const PAGE_SIZE = 5000;
const MAX_PAGES = 10;
/** The report only looks at searches from the Netherlands (ISO 3166-1 alpha-3, as the API wants it). */
const COUNTRY = 'nld';
const TZ = 'Europe/Amsterdam';

const shift = (date: string, days: number) => isoDay(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS);

/** Writes to stdout/stderr without console, so a test can prove nothing else is printed. */
const say = (text: string) => process.stdout.write(`${text}\n`);
const fail = (text: string) => process.stderr.write(`${text}\n`);

type ApiRow = { keys: string[]; clicks: number; impressions: number; position: number };
type Filter = { dimension: string; operator: string; expression: string };

class ApiError extends Error {}

async function post(token: string, site: string, body: Record<string, unknown>, extra: Filter[] = []): Promise<ApiRow[]> {
  const response = await fetch(`${API}/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: COUNTRY }, ...extra] }],
    }),
  });
  // Only the status code: the body is not printed, even on an error.
  if (!response.ok) throw new ApiError(`Search Console gaf HTTP ${response.status}.`);
  return ((await response.json()) as { rows?: ApiRow[] }).rows ?? [];
}

async function pairRows(token: string, site: string, period: Period): Promise<SearchRow[]> {
  const out: SearchRow[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const rows = await post(token, site, {
      startDate: period.start,
      endDate: period.end,
      dimensions: ['query', 'page'],
      rowLimit: PAGE_SIZE,
      startRow: page * PAGE_SIZE,
    });
    for (const r of rows) {
      out.push({ query: r.keys[0] ?? '', page: r.keys[1] ?? '', clicks: r.clicks, impressions: r.impressions, position: r.position });
    }
    if (rows.length < PAGE_SIZE) break;
  }
  return out;
}

/** The figures of one query (all pages, Netherlands) in a window; null when it had no impressions. */
async function figuresOf(token: string, site: string, query: string, window: Period): Promise<Figures | null> {
  const rows = await post(
    token,
    site,
    { startDate: window.start, endDate: window.end, dimensions: ['query'], rowLimit: 1 },
    [{ dimension: 'query', operator: 'equals', expression: query }],
  );
  const row = rows[0];
  return row ? { positie: row.position, vertoningen: row.impressions, klikken: row.clicks } : null;
}

/** What the site itself offers for a query, from the same search as the header search. */
function offerLookup(): (query: string) => OfferMatch {
  const config = JSON.parse(readFileSync(new URL('../src/search/search-config.json', import.meta.url), 'utf8')) as SearchConfig;
  const index = prepareIndex(buildSearchIndex());
  const generic = new Set<string>(GENERIC_WORDS);
  return (query) => {
    const words = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const rest = words.filter((word) => !generic.has(word));
    // Only category words ("hockeystick kopen"): the catalogue overview is the matching page.
    if (rest.length === 0) return { kind: 'categorie', path: '/sticks' };
    const found = search(index, rest.join(' '), config, { sticks: 1, brands: 1, articles: 1 });
    const stick = found.sticks[0]?.item;
    if (stick) return { kind: 'stick', path: stick.path };
    const brand = found.brands[0]?.item;
    if (brand) return { kind: 'merk', path: brand.path };
    if (found.answer) return { kind: 'artikel', path: found.answer.path };
    const article = found.articles[0]?.item;
    if (article) return { kind: 'artikel', path: article.path };
    if (found.wijzerHint) return { kind: 'tool', path: '/stickwijzer' };
    // A word that points at one of our category pages (zaal, veld): not outside our offer.
    const category = categoryPathOf(rest);
    if (category) return { kind: 'categorie', path: category };
    // A loose match: one word of the query finds something of ours. We do not know which page fits, so no path.
    for (const word of rest.filter((w) => w.length >= 4)) {
      const loose = search(index, word, config, { sticks: 1, brands: 1, articles: 1 });
      if (loose.sticks[0] || loose.brands[0] || loose.articles[0] || loose.answer) return { kind: 'verwant', path: null };
    }
    return { kind: 'geen', path: null };
  };
}

const LIVE_SITE = 'https://jouwhockeystick.nl';

/** Reads each live page once and answers whether it links to the other. A page that cannot be read stays unknown. */
async function liveLinks(pairs: readonly (readonly [string, string])[]): Promise<LinkLookup> {
  const pages = new Map<string, string>();
  for (const from of new Set(pairs.map(([page]) => page))) {
    try {
      const response = await fetch(`${LIVE_SITE}${from}`, { signal: AbortSignal.timeout(15_000) });
      if (response.ok) pages.set(from, await response.text());
    } catch {
      // Unknown: the report then keeps the general advice.
    }
  }
  return (from, to) => {
    const html = pages.get(from);
    return html === undefined ? undefined : hasContentLink(html, to);
  };
}

/** The history of the previous sealed file, when it can be opened; otherwise an empty history. */
function previousHistory(path: string | undefined, key: string): { history: HistoryMonth[]; read: boolean } {
  if (!path) return { history: [], read: false };
  try {
    const file = JSON.parse(readFileSync(path, 'utf8')) as { versleuteld?: Sealed };
    if (!file.versleuteld) return { history: [], read: false };
    const parsed = SeoReport.shape.historie.safeParse((unseal(file.versleuteld, key) as { historie?: unknown }).historie);
    return parsed.success ? { history: parsed.data, read: true } : { history: [], read: false };
  } catch {
    return { history: [], read: false };
  }
}

// ---------------------------------------------------------------- PostHog (organic funnel)

const FUNNEL_FILTERS = { liveHosts: LIVE_HOSTS, botPattern: BOT_PATTERN } as const;

/**
 * Visitors from Google (no campaign) per landing page and how many clicked to a shop that day. Null when
 * PostHog cannot be read (no key, or an error): the funnel is then left out of the report. A query error
 * is never printed; only a fixed sentence, because it may hold part of the query.
 */
async function organicFunnel(period: Period): Promise<Funnel | null> {
  try {
    const config = readPosthogConfig();
    return funnelFromRows(await hogql(config, funnelQuery(period, FUNNEL_FILTERS), 'seo-funnel'), period);
  } catch {
    return null;
  }
}

/** The funnel of one page in a window (zeros when nobody came from Google); undefined when PostHog cannot be read. */
async function pageFunnel(page: string, window: Period): Promise<FunnelFigures | undefined> {
  try {
    const config = readPosthogConfig();
    return funnelFromRows(await hogql(config, funnelQuery(window, FUNNEL_FILTERS, page), 'seo-funnel-pagina'), window).totaal;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------- GitHub (issues without figures)

type GhIssue = { number: number; body: string | null; state: string; labels: { name: string }[]; pull_request?: unknown };

/** The GitHub API of this repository, or null outside a workflow (no token or repository given). */
function githubApi() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return null;
  const call = async (path: string, init: { method?: string; body?: unknown } = {}) => {
    const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      ...(init.body !== undefined && { body: JSON.stringify(init.body) }),
    });
    return response;
  };
  return call;
}

async function issuesWithLabel(call: NonNullable<ReturnType<typeof githubApi>>, label: string): Promise<GhIssue[]> {
  const response = await call(`/issues?labels=${label}&state=all&per_page=100`);
  if (!response.ok) throw new ApiError(`GitHub gaf HTTP ${response.status}.`);
  return ((await response.json()) as GhIssue[]).filter((issue) => !issue.pull_request);
}

/** The day the label seo-uitgevoerd was set on an issue (the newest time), from its events. */
async function doneDate(call: NonNullable<ReturnType<typeof githubApi>>, number: number): Promise<string | undefined> {
  const response = await call(`/issues/${number}/events?per_page=100`);
  if (!response.ok) return undefined;
  const events = (await response.json()) as { event: string; created_at: string; label?: { name: string } }[];
  const times = events.filter((e) => e.event === 'labeled' && e.label?.name === LABELS.done).map((e) => e.created_at);
  return times.sort().at(-1)?.slice(0, 10);
}

async function statusesOf(issues: readonly GhIssue[], call: NonNullable<ReturnType<typeof githubApi>>): Promise<RecStatus[]> {
  const like: IssueLike[] = [];
  for (const issue of issues) {
    const labels = issue.labels.map((label) => label.name);
    const uitgevoerdOp = labels.includes(LABELS.done) ? await doneDate(call, issue.number) : undefined;
    like.push({ body: issue.body, labels, number: issue.number, ...(uitgevoerdOp && { uitgevoerdOp }) });
  }
  return statusesFromIssues(like);
}

async function ensureLabels(call: NonNullable<ReturnType<typeof githubApi>>) {
  const labels = [
    { name: LABELS.recommendation, color: '0E8A16', description: 'SEO-kans uit het maandrapport (zonder cijfers)' },
    { name: LABELS.approved, color: '1D76DB', description: 'De eigenaar keurt deze SEO-kans goed' },
    { name: LABELS.done, color: '5319E7', description: 'De wijziging staat live; het maandrapport meet het effect' },
    { name: LABELS.social, color: 'C5DEF5', description: 'Idee voor social uit het SEO-maandrapport (zonder cijfers)' },
  ];
  // A label that exists answers 422: that is fine.
  for (const label of labels) await call('/labels', { method: 'POST', body: label });
}

/** One issue per new recommendation, unless an open issue with the same marker exists. Returns how many were made. */
async function createIssues(
  call: NonNullable<ReturnType<typeof githubApi>>,
  recommendations: SeoReport['aanbevelingen'],
  issues: readonly GhIssue[],
  numbers: Map<string, number>,
): Promise<number> {
  const open = new Set(issues.filter((issue) => issue.state === 'open').map((issue) => idFromBody(issue.body)));
  let made = 0;
  for (const rec of recommendations) {
    if (open.has(rec.id)) continue;
    const draft = issueFor(rec);
    const response = await call('/issues', { method: 'POST', body: { title: draft.title, body: draft.body, labels: draft.labels } });
    if (!response.ok) continue;
    made += 1;
    await rememberNumber(response, draft.id, numbers);
  }
  return made;
}

/** Keeps the number of a newly created issue, so the report can link to it. */
async function rememberNumber(response: Response, id: string, numbers: Map<string, number>) {
  const created = (await response.json().catch(() => ({}))) as { number?: unknown };
  if (typeof created.number === 'number') numbers.set(id, created.number);
}

/** One issue per social idea (action E), unless an issue with the same marker exists, open or closed: a closed idea is a "no". */
async function createSocialIssues(
  call: NonNullable<ReturnType<typeof githubApi>>,
  ideas: SeoReport['bewustNiet'],
  existing: readonly GhIssue[],
  numbers: Map<string, number>,
): Promise<number> {
  const known = new Set(existing.map((issue) => idFromBody(issue.body)));
  let made = 0;
  for (const idea of ideas.filter((item) => item.code === 'E')) {
    const draft = socialIssueFor(idea);
    if (known.has(draft.id)) continue;
    const response = await call('/issues', { method: 'POST', body: { title: draft.title, body: draft.body, labels: draft.labels } });
    if (!response.ok) continue;
    made += 1;
    await rememberNumber(response, draft.id, numbers);
  }
  return made;
}

/** The result of a measurement goes on its issue as a word, and the issue is closed. Returns how many were answered. */
async function answerOutcomes(
  call: NonNullable<ReturnType<typeof githubApi>>,
  results: readonly { due: Due; outcome: ReturnType<typeof outcomeOf> }[],
): Promise<number> {
  let answered = 0;
  for (const { due, outcome } of results) {
    if (due.issue === undefined) continue;
    const comment = await call(`/issues/${due.issue}/comments`, { method: 'POST', body: { body: outcomeComment(outcome) } });
    if (!comment.ok) continue;
    await call(`/issues/${due.issue}`, { method: 'PATCH', body: { state: 'closed', state_reason: 'completed' } });
    answered += 1;
  }
  return answered;
}

async function main() {
  const key = process.env.VERKOOP_SLEUTEL;
  if (!key) {
    fail('VERKOOP_SLEUTEL ontbreekt (GitHub Secrets): geen SEO-kansenrapport geschreven.');
    process.exitCode = 3;
    return;
  }
  const out = process.argv[2] ?? 'seo.json';
  // The messages of these two have no figures (a missing secret, a refused login), so they may be shown.
  const token = await getToken(readServiceAccount()).catch((error: unknown) => {
    throw new ApiError(error instanceof Error ? error.message : 'Inloggen bij Google mislukt.');
  });
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: TZ });

  const candidates = process.env.GSC_SITE_URL ? [process.env.GSC_SITE_URL] : SITES;
  let site: string | null = null;
  let last = '';
  for (const candidate of candidates) {
    try {
      // The last day Search Console actually reported: an unprocessed day is unknown, not zero.
      const days = await post(token, candidate, {
        startDate: shift(today, -(LAG_DAYS + 14)),
        endDate: shift(today, -LAG_DAYS),
        dimensions: ['date'],
      });
      last = lastReportedDay(days.map((r) => ({ date: r.keys[0] ?? '' })), shift(today, -LAG_DAYS)) ?? shift(today, -LAG_DAYS);
      site = candidate;
      break;
    } catch {
      // Try the next property form.
    }
  }
  if (!site) throw new ApiError('Geen toegang tot de Search Console-property (rechten Beperkt voor het serviceaccount).');

  const period = { start: shift(last, -(PERIOD_DAYS - 1)), end: last };
  const previousPeriod = { start: shift(last, -(2 * PERIOD_DAYS - 1)), end: shift(last, -PERIOD_DAYS) };
  const longPeriod = { start: shift(last, -(LONG_DAYS - 1)), end: last };
  // Sequential on purpose: a few calls, in the same order every month.
  const current = await pairRows(token, site, period);
  const previous = await pairRows(token, site, previousPeriod);
  const long = await pairRows(token, site, longPeriod);

  const now = new Date();
  const month = today.slice(0, 7);
  const loaded = previousHistory(process.argv[3], key);
  let history = loaded.history;

  // The status of earlier recommendations comes from the labels on their issues; without a token there are none.
  const github = githubApi();
  let issues: GhIssue[] = [];
  let githubFailed = false;
  const results: { due: Due; outcome: ReturnType<typeof outcomeOf> }[] = [];
  if (github) {
    try {
      issues = await issuesWithLabel(github, LABELS.recommendation);
    } catch {
      githubFailed = true;
    }
  }
  if (github && !githubFailed) {
    const due = dueForEvaluation(history, await statusesOf(issues, github), last);
    for (const item of due) {
      const after = await figuresOf(token, site, item.zoekterm, item.window);
      // Action D is judged on the funnel of its page (Google visitors who click to a shop); the others on the position.
      const funnelAfter = item.code === 'D' ? await pageFunnel(item.pagina, item.window) : undefined;
      results.push({ due: item, outcome: outcomeOf(item, after, funnelAfter) });
    }
    history = applyOutcomes(history, results);
  }

  const funnel = await organicFunnel(period);
  const input = {
    month,
    now,
    period,
    previousPeriod,
    current,
    previous,
    long,
    offerOf: offerLookup(),
    history,
    // The patterns of the imported Google Trends exports (data/trends/), when there are any.
    season: seasonFromExports(readTrendExports().exports),
    funnel,
  };
  // A first pass only collects which links matter; then the live pages are read and the report is made.
  const pairs: [string, string][] = [];
  analyse({ ...input, linked: (from, to) => void pairs.push([from, to]) });
  const report = analyse({ ...input, linked: await liveLinks(pairs) });

  // Metadata without any figure, plus the sealed report (same format as dagcijfers.json).
  const file = { versie: 1, gemaakt: now.toISOString(), maand: month, regelset: SEO_RULESET_VERSION, versleuteld: seal(report, key, now) };
  writeFileSync(out, `${JSON.stringify(file)}\n`);
  say(statusLine(report));
  if (!funnel) say('PostHog gaf geen cijfers: de organische funnel is deze maand overgeslagen.');
  if (process.argv[3] && !loaded.read) say('Let op: de historie van de vorige maand kon niet worden gelezen; de historie begint opnieuw.');

  // Issues come last: the sealed report is already written, so a GitHub problem never loses it.
  // The issue numbers go into the report afterwards (the studio links to them), by writing the file once more.
  if (github && githubFailed) {
    say('De GitHub-koppeling gaf een fout: statussen en issues zijn deze maand overgeslagen.');
  } else if (github) {
    const numbers = new Map<string, number>();
    const remember = (list: readonly GhIssue[]) => {
      for (const issue of list.filter((i) => i.state === 'open')) {
        const id = idFromBody(issue.body);
        if (id) numbers.set(id, issue.number);
      }
    };
    remember(issues);
    try {
      const socialIssues = await issuesWithLabel(github, LABELS.social);
      remember(socialIssues);
      if (process.env.SEO_ISSUES !== 'uit') {
        await ensureLabels(github);
        say(`Issues gemaakt: ${await createIssues(github, report.aanbevelingen, issues, numbers)}.`);
        say(`Social-ideeën gemaakt: ${await createSocialIssues(github, report.bewustNiet, socialIssues, numbers)}.`);
        say(`Resultaten op issues gezet en afgesloten: ${await answerOutcomes(github, results)}.`);
      }
    } catch {
      say('De GitHub-koppeling gaf een fout bij het maken van issues.');
    }
    if (numbers.size > 0) {
      const linked = withIssueNumbers(report, numbers);
      writeFileSync(out, `${JSON.stringify({ ...file, versleuteld: seal(linked, key, now) })}\n`);
    }
  }
}

main().catch((error: unknown) => {
  // A fixed sentence or an ApiError (status code only): never a row, a query or a response body.
  fail(`SEO-kansenrapport mislukt: ${error instanceof ApiError ? error.message : 'onverwachte fout (zie de stap in de workflow).'}`);
  process.exitCode = 1;
});
