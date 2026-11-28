/**
 * KPI Performance (decision log 2026-11-27): the counts behind the tab "KPI" of
 * the Marketingstudio. Pure part: the schema, the HogQL queries and the row
 * parsing. scripts/daily-metrics.ts runs the queries; the result travels as the
 * `kpi` part of the sealed daily figures. Targets, ratios and statuses are not
 * here: those live in social/studio/kpi.js, and the targets only in the studio's
 * own database (never in this public repository).
 *
 * A "visit" is a session with at least one pageview, counted on the Amsterdam
 * day it started, after the visitor filter (src/analytics-report/visitorFilter.ts).
 * Every session falls on one day, so the daily counts can be added up to any
 * period, and every ratio is computed from those totals.
 */
import { z } from 'zod';
import { sourceLabel } from '../analytics-report/conversion';
import { LIVE_HOSTS, LIVE_VISITORS } from '../analytics-report/hogql';
import { VISITOR_SEGMENT } from '../analytics-report/visitorFilter';

const TZ = 'Europe/Amsterdam';

/** First day of PostHog data on the live site. */
export const KPI_START = '2026-10-06';
/** At most this many days travel with the daily figures. */
export const KPI_MAX_DAYS = 430;
/** The breakdowns (sources, pages, shops) cover the last full days. */
export const BREAKDOWN_DAYS = 28;

/** "Use of the comparison": a session with at least one of these (owner, 2026-11-27). */
export const COMPARE_EVENTS = ['offer_compare_click', 'product_card_click', 'indoor_selection', 'versus_view', 'catalog_block_click'] as const;

const EVENTS = ['$pageview', 'retailer_click', 'advice_started', 'advice_completed', ...COMPARE_EVENTS];

export const DAY_FIELDS = [
  'sessies',
  'metKlik',
  'klikken',
  'vergelijker',
  'homepage',
  'homepageStart',
  'wijzerStart',
  'wijzerKlaar',
  'resultaat',
  'resultaatKlik',
] as const;

const n = z.number().int().nonnegative();

/**
 * A day travels as a short list, so a year of days stays small in the studio's
 * database: date, DAY_FIELDS, then the sessions the visitor filter left out
 * (technical, outside Europe). social/studio/kpi.js reads the same order.
 */
export const DAY_COLUMNS = ['date', ...DAY_FIELDS, 'technisch', 'buitenEuropa'] as const;
export const KpiDay = z.tuple([z.string(), n, n, n, n, n, n, n, n, n, n, n, n]);
export type KpiDay = z.infer<typeof KpiDay>;

const Group = z.object({ key: z.string(), sessies: n, metKlik: n });
export type Group = z.infer<typeof Group>;

const Period = z.object({ start: z.string(), end: z.string() });

export const KpiSessions = z.object({
  dagen: z.array(KpiDay),
  uitsplitsing: z.object({
    periode: Period,
    bronnen: z.array(Group),
    apparaten: z.array(Group),
    /** By the first page of the session. */
    paginagroepen: z.array(Group),
    /** Shop clicks per shop and per place on the site. */
    winkels: z.array(z.object({ key: z.string(), klikken: n })),
    plaatsingen: z.array(z.object({ key: z.string(), klikken: n })),
    /** Pages with the most sessions that clicked to a shop from that page. */
    paginas: z.array(Group),
  }),
});
export type KpiSessions = z.infer<typeof KpiSessions>;

/** Date, clicks, impressions. */
export const KpiSearchDay = z.tuple([z.string(), n, n]);
export type KpiSearchDay = z.infer<typeof KpiSearchDay>;

const part = <T extends z.ZodType>(value: T) =>
  z.discriminatedUnion('ok', [z.object({ ok: z.literal(true), value }), z.object({ ok: z.literal(false), reden: z.string() })]);

export const Kpi = z.object({
  versie: z.literal(1),
  /** Last full day of the PostHog series. */
  tot: z.string(),
  sessies: part(KpiSessions),
  google: part(z.object({ dagen: z.array(KpiSearchDay) })),
});
export type Kpi = z.infer<typeof Kpi>;

const at = (date: string) => `toDateTime('${date} 00:00:00', '${TZ}')`;
const list = (values: readonly string[]) => values.map((v) => `'${v}'`).join(', ');
const nextDay = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
const between = (start: string, end: string) => `timestamp >= ${at(start)} AND timestamp < ${at(nextDay(end))}`;
const SID = `toString(properties.$session_id)`;
const day = (expr: string) => `toDate(toTimeZone(${expr}, '${TZ}'))`;

/** One row per day: date, then DAY_FIELDS in order. */
export function daysQuery(start: string, end: string): string {
  return `SELECT toString(d), count(), countIf(klik > 0), sum(klik), countIf(verg > 0), countIf(home > 0),
  countIf(home > 0 AND gestart > 0), countIf(gestart > 0), countIf(gestart > 0 AND klaar > 0), countIf(klaar > 0), countIf(klaar > 0 AND wklik > 0)
FROM (
  SELECT ${SID} AS sid, ${day('min(timestamp)')} AS d,
    countIf(event = '$pageview') AS pv,
    countIf(event = 'retailer_click') AS klik,
    countIf(event IN (${list(COMPARE_EVENTS)})) AS verg,
    countIf(event = '$pageview' AND properties.$pathname = '/') AS home,
    countIf(event = 'advice_started') AS gestart,
    countIf(event = 'advice_completed') AS klaar,
    countIf(event = 'retailer_click' AND properties.placement = 'stickwijzer') AS wklik
  FROM events
  WHERE ${between(start, end)} AND ${LIVE_VISITORS} AND event IN (${list(EVENTS)}) AND ${SID} != ''
  GROUP BY sid HAVING pv > 0
)
GROUP BY d ORDER BY d LIMIT ${KPI_MAX_DAYS + 10}`;
}

/** One row per day: date, sessions with technical marks, sessions from outside Europe. */
export function excludedQuery(start: string, end: string): string {
  return `SELECT toString(d), countIf(groep = 'technical'), countIf(groep = 'outside')
FROM (
  SELECT ${SID} AS sid, ${day('min(timestamp)')} AS d, any(${VISITOR_SEGMENT}) AS groep
  FROM events
  WHERE ${between(start, end)} AND properties.$host IN (${list(LIVE_HOSTS)}) AND ${SID} != ''
  GROUP BY sid HAVING countIf(event = '$pageview') > 0
)
GROUP BY d ORDER BY d LIMIT ${KPI_MAX_DAYS + 10}`;
}

/** One row per source, device and first page: source key, device, path, sessions, sessions with a shop click. */
export function landingQuery(start: string, end: string): string {
  const source = `if(coalesce(toString(properties.utm_source), '') != '', concat('utm:', toString(properties.utm_source)), coalesce(toString(properties.$referring_domain), '$direct'))`;
  return `SELECT src, device, landing, count(), countIf(klik > 0)
FROM (
  SELECT ${SID} AS sid,
    argMinIf(${source}, timestamp, event = '$pageview') AS src,
    argMinIf(coalesce(toString(properties.$device_type), ''), timestamp, event = '$pageview') AS device,
    argMinIf(coalesce(toString(properties.$pathname), ''), timestamp, event = '$pageview') AS landing,
    countIf(event = 'retailer_click') AS klik
  FROM events
  WHERE ${between(start, end)} AND ${LIVE_VISITORS} AND event IN ('$pageview', 'retailer_click') AND ${SID} != ''
  GROUP BY sid HAVING countIf(event = '$pageview') > 0
)
GROUP BY src, device, landing ORDER BY count() DESC LIMIT 5000`;
}

/** One row per shop and place: shop, placement, clicks. */
export function clicksQuery(start: string, end: string): string {
  return `SELECT coalesce(toString(properties.retailer), ''), coalesce(toString(properties.placement), ''), count()
FROM events
WHERE ${between(start, end)} AND ${LIVE_VISITORS} AND event = 'retailer_click'
GROUP BY 1, 2 ORDER BY count() DESC LIMIT 500`;
}

/** One row per page with a shop click: path, sessions that saw it, sessions that clicked on it. */
export function pagesQuery(start: string, end: string): string {
  return `SELECT path, count(), countIf(klik > 0)
FROM (
  SELECT ${SID} AS sid, coalesce(toString(properties.$pathname), '') AS path,
    countIf(event = '$pageview') AS pv, countIf(event = 'retailer_click') AS klik
  FROM events
  WHERE ${between(start, end)} AND ${LIVE_VISITORS} AND event IN ('$pageview', 'retailer_click') AND ${SID} != ''
  GROUP BY sid, path
)
WHERE pv > 0
GROUP BY path HAVING countIf(klik > 0) > 0 ORDER BY countIf(klik > 0) DESC, count() DESC LIMIT 10`;
}

const int = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));

/** Every date of the range; a day without sessions is a real zero (the query succeeded). */
export function parseDays(rows: unknown[][], excluded: unknown[][], dates: readonly string[]): KpiDay[] {
  const counts = new Map(rows.map((r) => [String(r[0]), r]));
  const out = new Map(excluded.map((r) => [String(r[0]), r]));
  return dates.map((date): KpiDay => {
    const row = counts.get(date);
    const v = (i: number) => int(row?.[i]);
    return [date, v(1), v(2), v(3), v(4), v(5), v(6), v(7), v(8), v(9), v(10), int(out.get(date)?.[1]), int(out.get(date)?.[2])];
  });
}

/** The kind of page a session started on. */
export function pageGroup(path: string): string {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return 'Startpagina';
  const [, first = '', second] = p.split('/');
  if (first === 'stickwijzer') return 'Stickwijzer';
  if (first === 'zaalsticks') return 'Zaalsticks';
  if (first === 'sticks') return second ? 'Productpagina stick' : 'Catalogus sticks';
  if (first === 'hockeyschoenen') return 'Hockeyschoenen';
  if (first === 'merken') return 'Merkpagina';
  if (first === 'vergelijk') return 'Vergelijkpagina';
  if (first === 'kennis') return 'Kennis en advies';
  if (first === 'blog') return 'Blog';
  return 'Overig';
}

function group(rows: { key: string; sessies: number; metKlik: number }[], max: number): Group[] {
  const totals = new Map<string, Group>();
  for (const r of rows) {
    const t = totals.get(r.key) ?? { key: r.key, sessies: 0, metKlik: 0 };
    t.sessies += r.sessies;
    t.metKlik += r.metKlik;
    totals.set(r.key, t);
  }
  return [...totals.values()].sort((a, b) => b.sessies - a.sessies || a.key.localeCompare(b.key)).slice(0, max);
}

export function parseBreakdown(
  periode: { start: string; end: string },
  landing: unknown[][],
  clicks: unknown[][],
  pages: unknown[][],
): KpiSessions['uitsplitsing'] {
  const rows = landing.map((r) => ({
    source: sourceLabel(String(r[0] ?? '')),
    device: String(r[1] ?? '') || 'onbekend',
    page: pageGroup(String(r[2] ?? '')),
    sessies: int(r[3]),
    metKlik: int(r[4]),
  }));
  const per = (key: 'source' | 'device' | 'page', max: number) => group(rows.map((r) => ({ key: r[key], sessies: r.sessies, metKlik: r.metKlik })), max);
  const sumClicks = (index: 0 | 1) => {
    const totals = new Map<string, number>();
    for (const r of clicks) {
      const key = String(r[index] ?? '') || 'onbekend';
      totals.set(key, (totals.get(key) ?? 0) + int(r[2]));
    }
    return [...totals].map(([key, klikken]) => ({ key, klikken })).sort((a, b) => b.klikken - a.klikken || a.key.localeCompare(b.key));
  };
  return {
    periode,
    bronnen: per('source', 15),
    apparaten: per('device', 5),
    paginagroepen: per('page', 12),
    winkels: sumClicks(0),
    plaatsingen: sumClicks(1),
    paginas: pages.map((r) => ({ key: String(r[0] ?? ''), sessies: int(r[1]), metKlik: int(r[2]) })),
  };
}
