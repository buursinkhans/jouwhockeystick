// Daily figures (read-only): PostHog (yesterday and the 34 days before, in
// Amsterdam days, plus today so far), Search Console (daily totals plus the queries of the last
// 7 available days) and Bing (daily totals). Writes one JSON file (path as
// first argument, default dagcijfers.json) for the routine "Dagbericht"; see
// docs/marketing/dagbericht.md. A source that fails gets {ok:false, reden}:
// the others still go through. Counts only, never persons or amounts.
// The search queries, sources and countries go sealed with VERKOOP_SLEUTEL
// into a second file (second argument, default dagcijfers-detail.json;
// security review 2026-11-13). Without the key that file is not written and
// the run ends with code 2, like a failed source.
// Run with: npm run metrics:daily -- out.json detail.json
import { writeFileSync } from 'node:fs';
import type { z } from 'zod';
import { sourceLabel } from '../src/analytics-report/conversion';
import { BOT_PATTERN, hogql, LIVE_HOSTS, readPosthogConfig } from '../src/analytics-report/hogql';
import { dayRows, redact, registeredSite, SitesAnswer, TrafficAnswer } from '../src/marketing/bingReport';
import {
  compareAll,
  Dagcijfers,
  splitDagcijfers,
  DAY_MS,
  dateRange,
  fillDays,
  isoDay,
  POSTHOG_METRICS,
  risers,
  SEARCH_METRICS,
  SERIES_DAYS,
  topQueries,
  type PosthogDay,
  type QueryRow,
  type SearchDay,
} from '../src/marketing/dailyMetrics';
import { seal } from '../src/marketing/seal';
import { loadSiteConfig } from '../src/marketing/siteConfig';
import { getToken, readServiceAccount } from '../src/seo/googleAuth';

const TZ = 'Europe/Amsterdam';
const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const GSC_LAG_DAYS = 3;
const GSC_SITES = ['sc-domain:jouwhockeystick.nl', 'https://jouwhockeystick.nl/'];
const BING_API = 'https://ssl.bing.com/webmaster/api.svc/json';

const amsterdamToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: TZ });
const shift = (date: string, days: number) => isoDay(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS);
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
const why = (e: unknown) => (e instanceof Error ? e.message : 'onbekende fout');

async function posthog(yesterday: string): Promise<Dagcijfers['posthog']> {
  try {
    const config = readPosthogConfig();
    const first = shift(yesterday, -(SERIES_DAYS - 1));
    const at = (date: string) => `toDateTime('${date} 00:00:00', '${TZ}')`;
    const live = [
      `properties.$host IN (${LIVE_HOSTS.map((h) => `'${h}'`).join(', ')})`,
      `NOT match(coalesce(toString(properties.$raw_user_agent), ''), '${BOT_PATTERN}')`,
    ].join(' AND ');
    const yesterdayOnly = `timestamp >= ${at(yesterday)} AND timestamp < ${at(shift(yesterday, 1))} AND ${live}`;

    // Sequential on purpose: PostHog allows only a few concurrent queries.
    const days = await hogql(
      config,
      `SELECT toString(toDate(toTimeZone(timestamp, '${TZ}'))) AS d,
         count(DISTINCT if(event = '$pageview', distinct_id, NULL)),
         countIf(event = '$pageview'),
         count(DISTINCT if(event = 'advice_started', distinct_id, NULL)),
         count(DISTINCT if(event = 'advice_completed', distinct_id, NULL)),
         countIf(event = 'retailer_click')
       FROM events
       WHERE timestamp >= ${at(first)} AND timestamp < ${at(shift(yesterday, 2))} AND ${live}
         AND event IN ('$pageview', 'advice_started', 'advice_completed', 'retailer_click')
       GROUP BY d ORDER BY d`,
      'dagcijfers',
    );
    const rows: PosthogDay[] = days.map((r) => ({
      date: String(r[0]),
      bezoekers: num(r[1]),
      paginaweergaven: num(r[2]),
      wijzerStart: num(r[3]),
      wijzerKlaar: num(r[4]),
      winkelklikken: num(r[5]),
    }));
    // Today so far (the afternoon run): shown apart, never in the series or the comparison.
    const today = shift(yesterday, 1);
    const todayRow = rows.find((r) => r.date === today);
    const vandaag = { ...(todayRow ?? { date: today, bezoekers: 0, paginaweergaven: 0, wijzerStart: 0, wijzerKlaar: 0, winkelklikken: 0 }), tot: new Date().toISOString() };
    const dagen = fillDays(rows, dateRange(first, yesterday), (date) => ({
      date,
      bezoekers: 0,
      paginaweergaven: 0,
      wijzerStart: 0,
      wijzerKlaar: 0,
      winkelklikken: 0,
    }));

    // Source of each visitor's first pageview yesterday, grouped as in the weekly report.
    const source = `if(coalesce(toString(properties.utm_source), '') != '', concat('utm:', toString(properties.utm_source)), coalesce(toString(properties.$referring_domain), '$direct'))`;
    const sources = await hogql(
      config,
      `SELECT src, count() AS n FROM (
         SELECT distinct_id, argMin(${source}, timestamp) AS src
         FROM events WHERE event = '$pageview' AND ${yesterdayOnly} GROUP BY distinct_id
       ) GROUP BY src ORDER BY n DESC LIMIT 50`,
      'dagcijfers-bronnen',
    );
    const bySource = new Map<string, number>();
    for (const r of sources) {
      const label = sourceLabel(String(r[0] ?? ''));
      bySource.set(label, (bySource.get(label) ?? 0) + num(r[1]));
    }

    const countries = await hogql(
      config,
      `SELECT coalesce(toString(properties.$geoip_country_code), '?') AS land, count(DISTINCT distinct_id) AS n
       FROM events WHERE event = '$pageview' AND ${yesterdayOnly} GROUP BY land ORDER BY n DESC LIMIT 10`,
      'dagcijfers-landen',
    );
    const top = <T extends { bezoekers: number; key: string }>(xs: T[], n: number) =>
      xs.sort((a, b) => b.bezoekers - a.bezoekers || a.key.localeCompare(b.key)).slice(0, n);

    return {
      ok: true,
      value: {
        dagen,
        vergelijking: compareAll(dagen, POSTHOG_METRICS),
        vandaag,
        bronnen: top([...bySource].map(([key, bezoekers]) => ({ key, bezoekers })), 6),
        landen: top(countries.map((r) => ({ key: String(r[0] ?? '?'), bezoekers: num(r[1]) })), 5),
      },
    };
  } catch (e) {
    return { ok: false, reden: `PostHog: ${why(e)}` };
  }
}

type GscRow = { keys: string[]; clicks: number; impressions: number; position: number };

async function gscQuery(token: string, site: string, start: string, end: string, dimension: 'date' | 'query') {
  const res = await fetch(`${GSC_API}/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: start, endDate: end, dimensions: [dimension], rowLimit: 1000 }),
  });
  if (!res.ok) throw new Error(`Search Console gaf HTTP ${res.status} voor ${site}: ${(await res.text()).slice(0, 160)}`);
  return ((await res.json()) as { rows?: GscRow[] }).rows ?? [];
}

async function google(today: string): Promise<Dagcijfers['google']> {
  try {
    const token = await getToken(readServiceAccount());
    const last = shift(today, -GSC_LAG_DAYS);
    const first = shift(last, -(SERIES_DAYS - 1));
    const candidates = process.env.GSC_SITE_URL ? [process.env.GSC_SITE_URL] : GSC_SITES;
    const failures: string[] = [];
    for (const site of candidates) {
      let byDate: GscRow[];
      try {
        byDate = await gscQuery(token, site, first, last, 'date');
      } catch (e) {
        failures.push(why(e));
        continue;
      }
      const toQuery = (r: GscRow): QueryRow => ({
        zoekterm: r.keys[0] ?? '',
        klikken: r.clicks,
        vertoningen: r.impressions,
        positie: r.position,
      });
      const periode = { start: shift(last, -6), end: last };
      const now = (await gscQuery(token, site, periode.start, periode.end, 'query')).map(toQuery);
      const before = (await gscQuery(token, site, shift(last, -13), shift(last, -7), 'query')).map(toQuery);
      const rows: SearchDay[] = byDate.map((r) => ({ date: r.keys[0] ?? '', klikken: r.clicks, vertoningen: r.impressions }));
      const dagen = fillDays(rows, dateRange(first, last), (date) => ({ date, klikken: 0, vertoningen: 0 }));
      return {
        ok: true,
        value: {
          dagen,
          vergelijking: compareAll(dagen, SEARCH_METRICS),
          periode,
          topZoektermen: topQueries(now),
          stijgers: risers(now, before),
        },
      };
    }
    return { ok: false, reden: failures.join(' ') || 'Geen Search Console-property gevonden.' };
  } catch (e) {
    return { ok: false, reden: `Search Console: ${why(e)}` };
  }
}

async function bingGet<S extends z.ZodType>(key: string, method: string, schema: S, siteUrl?: string): Promise<z.infer<S>> {
  const params = new URLSearchParams({ apikey: key });
  if (siteUrl) params.set('siteUrl', siteUrl);
  // The key is in the url: never let the url or the error object reach the output.
  let res: Response;
  try {
    res = await fetch(`${BING_API}/${method}?${params}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error(`${method} kon niet worden gelezen.`);
  }
  if (!res.ok) throw new Error(`${method} gaf HTTP ${res.status}.`);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new Error(`${method}: antwoord had een onverwachte vorm.`);
  return parsed.data;
}

async function bing(): Promise<Dagcijfers['bing']> {
  const key = process.env.BING_WEBMASTER_API_KEY;
  if (!key) return { ok: false, reden: 'BING_WEBMASTER_API_KEY ontbreekt (GitHub Secrets).' };
  try {
    const domain = loadSiteConfig().merk.domein;
    const site = registeredSite(await bingGet(key, 'GetUserSites', SitesAnswer), domain);
    if (!site) return { ok: false, reden: `${domain} staat niet bij de sites van deze sleutel in Bing Webmaster Tools.` };
    const rows = dayRows(await bingGet(key, 'GetRankAndTrafficStats', TrafficAnswer, site))
      .map((r) => ({ date: r.date.slice(0, 10), klikken: r.clicks, vertoningen: r.impressions }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const last = rows.at(-1)?.date;
    if (!last) return { ok: true, value: { dagen: [], vergelijking: [] } };
    const dagen = fillDays(rows, dateRange(shift(last, -(SERIES_DAYS - 1)), last), (date) => ({ date, klikken: 0, vertoningen: 0 }));
    return { ok: true, value: { dagen, vergelijking: compareAll(dagen, SEARCH_METRICS) } };
  } catch (e) {
    return { ok: false, reden: `Bing: ${redact(why(e), key)}` };
  }
}

async function main() {
  const today = amsterdamToday();
  const out: Dagcijfers = {
    versie: 1,
    gemaakt: new Date().toISOString(),
    site: loadSiteConfig().merk.domein,
    posthog: await posthog(shift(today, -1)),
    google: await google(today),
    bing: await bing(),
  };
  Dagcijfers.parse(out);
  const { publiek, detail } = splitDagcijfers(out);
  writeFileSync(process.argv[2] ?? 'dagcijfers.json', `${JSON.stringify(publiek, null, 1)}\n`);
  const passphrase = process.env.VERKOOP_SLEUTEL;
  if (passphrase) {
    writeFileSync(process.argv[3] ?? 'dagcijfers-detail.json', `${JSON.stringify(seal(detail, passphrase))}\n`);
  } else {
    process.stderr.write('VERKOOP_SLEUTEL ontbreekt (GitHub Secrets): zoektermen, bronnen en landen niet geschreven.\n');
  }
  const failed = (['posthog', 'google', 'bing'] as const).filter((k) => !out[k].ok);
  for (const k of failed) {
    const p = out[k];
    if (!p.ok) process.stderr.write(`${p.reden}\n`);
  }
  // Exit code 2: written, but one or more sources failed (the workflow still saves the file).
  if (failed.length || !passphrase) process.exitCode = 2;
}

main().catch((e: unknown) => {
  process.stderr.write(`Dagcijfers mislukt: ${why(e)}\n`);
  process.exit(1);
});
