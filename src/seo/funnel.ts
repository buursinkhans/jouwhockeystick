/**
 * The organic funnel (Phase 3, part 2): of the visitors who arrive from Google (no campaign), how
 * many click through to a shop the same day, per landing page. It makes SEO action D ("improve the
 * comparison or the product presentation") measurable: before and after a change, did more of the
 * visitors of that page click to a shop?
 *
 * Pure functions: the query text, the reading of its rows and the verdict. scripts/seo-opportunities.ts
 * runs the query. PostHog here is cookieless: a visitor is only known within one day, so the funnel
 * is "visited from Google and clicked to a shop on the same day". A shop click is not an order.
 */
import { z } from 'zod';
import type { Period } from './searchConsole';

/** A verdict needs at least this many visitors from Google on the page in both periods. */
export const FUNNEL_MIN_VISITORS = 20;
/** The click-through must change by at least this share (of its old value)... */
export const FUNNEL_RELATIVE_STEP = 0.25;
/** ...and by at least this many percentage points, so a few clicks do not decide. */
export const FUNNEL_POINT_STEP = 2;
/** The report lists pages with at least this many visitors from Google, the busiest first, at most this many. */
export const FUNNEL_LIST_MIN_VISITORS = 5;
export const FUNNEL_LIST_MAX = 15;

export const FunnelFigures = z.object({ bezoekers: z.number().int().min(0), klikkers: z.number().int().min(0) });
export type FunnelFigures = z.infer<typeof FunnelFigures>;

export const Funnel = z.object({
  periode: z.object({ start: z.string(), end: z.string() }),
  /** All visitors from Google (organic) in the period, and how many clicked to a shop that day. */
  totaal: FunnelFigures,
  /** The busiest landing pages with enough visitors to say anything. */
  paginas: z.array(FunnelFigures.extend({ pagina: z.string() })).max(FUNNEL_LIST_MAX),
});
export type Funnel = z.infer<typeof Funnel>;

const TZ = 'Europe/Amsterdam';

/** The site's events only, and no bots (the same filter as the weekly report and the daily figures). */
export type Filters = { liveHosts: readonly string[]; botPattern: string };

const quote = (text: string) => `'${text.replace(/'/g, "\\'")}'`;
const at = (date: string) => `toDateTime('${date} 00:00:00', '${TZ}')`;
const dayAfter = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/**
 * One row per landing page: visitors from Google (organic: a Google referrer and no utm_source) and
 * how many of them clicked to a shop that day. A visitor is one browser on one Amsterdam day.
 * `onlyPage` limits it to one page (for the measurement after a change).
 */
export function funnelQuery(period: Period, filters: Filters, onlyPage?: string): string {
  const live = [
    `properties.$host IN (${filters.liveHosts.map(quote).join(', ')})`,
    `NOT match(coalesce(toString(properties.$raw_user_agent), ''), ${quote(filters.botPattern)})`,
  ].join(' AND ');
  const page = onlyPage === undefined ? '' : ` AND landing IN (${[onlyPage, `${onlyPage}/`].map(quote).join(', ')})`;
  return `SELECT landing, count() AS bezoekers, countIf(clicked) AS klikkers FROM (
  SELECT distinct_id,
    toDate(toTimeZone(timestamp, '${TZ}')) AS d,
    argMinIf(coalesce(toString(properties.$pathname), ''), timestamp, event = '$pageview') AS landing,
    argMinIf(lower(coalesce(toString(properties.$referring_domain), '$direct')), timestamp, event = '$pageview') AS ref,
    argMinIf(coalesce(toString(properties.utm_source), ''), timestamp, event = '$pageview') AS campaign,
    countIf(event = 'retailer_click') > 0 AS clicked
  FROM events
  WHERE timestamp >= ${at(period.start)} AND timestamp < ${at(dayAfter(period.end))} AND ${live}
    AND event IN ('$pageview', 'retailer_click')
  GROUP BY distinct_id, d
) WHERE ref LIKE '%google.%' AND ref NOT LIKE '%jouwhockeystick%' AND campaign = ''${page}
GROUP BY landing
ORDER BY bezoekers DESC
LIMIT 500`;
}

/** The path of a page, without a trailing slash (the same rule as pagePath in opportunities.ts). */
const cleanPath = (path: string) => path.replace(/\/+$/, '') || '/';

const num = (value: unknown) => (typeof value === 'number' ? value : Number(value) || 0);

/** Reads the rows of funnelQuery: [landing, visitors, clickers]. A page with and without a trailing slash is one page. */
export function funnelFromRows(rows: readonly (readonly unknown[])[], period: Period): Funnel {
  const byPage = new Map<string, FunnelFigures>();
  for (const row of rows) {
    const landing = String(row[0] ?? '');
    if (!landing.startsWith('/')) continue;
    const page = cleanPath(landing.split('?')[0] as string);
    const entry = byPage.get(page) ?? { bezoekers: 0, klikkers: 0 };
    entry.bezoekers += num(row[1]);
    entry.klikkers += num(row[2]);
    byPage.set(page, entry);
  }
  const all = [...byPage].map(([pagina, f]) => ({ pagina, ...f }));
  const totaal = all.reduce((sum, p) => ({ bezoekers: sum.bezoekers + p.bezoekers, klikkers: sum.klikkers + p.klikkers }), { bezoekers: 0, klikkers: 0 });
  const paginas = all
    .filter((p) => p.bezoekers >= FUNNEL_LIST_MIN_VISITORS)
    .sort((a, b) => b.bezoekers - a.bezoekers || a.pagina.localeCompare(b.pagina))
    .slice(0, FUNNEL_LIST_MAX);
  return Funnel.parse({ periode: period, totaal, paginas });
}

/** The figures of one page, from the full list of a period (0 when it is not in the list). */
export function figuresOfPage(funnel: Funnel | null | undefined, page: string): FunnelFigures | null {
  if (!funnel) return null;
  const found = funnel.paginas.find((p) => p.pagina === cleanPath(page));
  return found ? { bezoekers: found.bezoekers, klikkers: found.klikkers } : null;
}

export const clickShare = (f: FunnelFigures): number => (f.bezoekers > 0 ? f.klikkers / f.bezoekers : 0);

export type FunnelVerdict = { oordeel: 'verbeterd' | 'gelijk' | 'verslechterd' | 'onvoldoende data'; toelichting: string };

/** Did the share of visitors from Google who clicked to a shop go up or down? A direction, never proof. */
export function funnelVerdict(before: FunnelFigures | null | undefined, after: FunnelFigures | null | undefined): FunnelVerdict {
  if (!before || !after || before.bezoekers < FUNNEL_MIN_VISITORS || after.bezoekers < FUNNEL_MIN_VISITORS) {
    return { oordeel: 'onvoldoende data', toelichting: 'Te weinig bezoekers uit Google op deze pagina, voor of na de wijziging, om een richting te zien.' };
  }
  const was = clickShare(before);
  const now = clickShare(after);
  const points = (now - was) * 100;
  const relative = was > 0 ? (now - was) / was : now > 0 ? Infinity : 0;
  const oordeel = points >= FUNNEL_POINT_STEP && relative >= FUNNEL_RELATIVE_STEP ? 'verbeterd' : points <= -FUNNEL_POINT_STEP && relative <= -FUNNEL_RELATIVE_STEP ? 'verslechterd' : 'gelijk';
  return {
    oordeel,
    toelichting:
      'Een richting, geen bewijs: het gaat om bezoekers uit Google die dezelfde dag naar een winkel klikken. Seizoen, de zoekopdrachten die bezoekers brengen en kleine aantallen verschuiven dat. Een winkelklik is geen bestelling.',
  };
}
