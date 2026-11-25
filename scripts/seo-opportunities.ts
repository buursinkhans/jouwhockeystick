// Monthly SEO opportunity report (read-only). Fetches Search Console rows for the
// Netherlands (query x page: the last 28 processed days, the 28 before, and
// about 90 days), looks up what the site offers for each query, and writes ONE
// sealed file (VERKOOP_SLEUTEL) that the Marketingstudio opens in the owner's
// browser. Design: docs/seo-market-intelligence-plan.md.
//
// The repository and its workflow logs are public, so this script prints one
// status line without any figure, query or page (statusLine). It never prints
// an HTTP body, a row or an error detail that could hold data.
//
// Usage: npm run seo:opportunities -- <out.json> [previous-seo.json]
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
  SEO_RULESET_VERSION,
  SeoReport,
  statusLine,
  type OfferMatch,
} from '../src/seo/opportunities';
import { getToken, readServiceAccount } from '../src/seo/googleAuth';
import { GENERIC_WORDS } from '../src/seo/seoConfig';
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

class ApiError extends Error {}

async function post(token: string, site: string, body: Record<string, unknown>): Promise<ApiRow[]> {
  const response = await fetch(`${API}/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: COUNTRY }] }],
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
    return { kind: 'geen', path: null };
  };
}

/** The history of the previous sealed file, when it can be opened; otherwise an empty history. */
function previousHistory(path: string | undefined, key: string) {
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
  // Sequential on purpose: three calls, in the same order every month.
  const current = await pairRows(token, site, period);
  const previous = await pairRows(token, site, previousPeriod);
  const long = await pairRows(token, site, longPeriod);

  const now = new Date();
  const month = today.slice(0, 7);
  const { history, read } = previousHistory(process.argv[3], key);
  const report = analyse({
    month,
    now,
    period,
    previousPeriod,
    current,
    previous,
    long,
    offerOf: offerLookup(),
    history,
  });

  // Metadata without any figure, plus the sealed report (same format as dagcijfers.json).
  const file = { versie: 1, gemaakt: now.toISOString(), maand: month, regelset: SEO_RULESET_VERSION, versleuteld: seal(report, key, now) };
  writeFileSync(out, `${JSON.stringify(file)}\n`);
  say(statusLine(report));
  if (process.argv[3] && !read) say('Let op: de historie van de vorige maand kon niet worden gelezen; de historie begint opnieuw.');
}

main().catch((error: unknown) => {
  // A fixed sentence or an ApiError (status code only): never a row, a query or a response body.
  fail(`SEO-kansenrapport mislukt: ${error instanceof ApiError ? error.message : 'onverwachte fout (zie de stap in de workflow).'}`);
  process.exitCode = 1;
});
