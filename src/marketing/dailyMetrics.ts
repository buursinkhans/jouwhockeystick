// Daily figures (dagcijfers): the pure part. scripts/daily-metrics.ts reads
// PostHog, Search Console and Bing and hands the rows to these functions; the
// result is one JSON file that the routine "Dagbericht" reads
// (docs/marketing/dagbericht.md). Counts only: no persons, no amounts.
import { z } from 'zod';

export const DAY_MS = 86_400_000;

/** Days kept in every series: enough for a 28-day average and a week before it. */
export const SERIES_DAYS = 35;

/**
 * When a day counts as "opvallend": enough history, a real difference in
 * numbers and in proportion. Small numbers swing a lot; these keep a jump
 * from 2 to 5 visitors out of the push notifications.
 */
export const ANOMALY = { minHistoryDays: 5, minAbsolute: 10, minRelative: 0.5 } as const;

/** A search query counts as a riser with this many extra impressions, at least 1.5 times as many as before. */
export const RISER = { minExtraImpressions: 10, minFactor: 1.5 } as const;

export const PosthogDay = z.object({
  date: z.string(),
  bezoekers: z.number(),
  paginaweergaven: z.number(),
  wijzerStart: z.number(),
  wijzerKlaar: z.number(),
  winkelklikken: z.number(),
});
export type PosthogDay = z.infer<typeof PosthogDay>;
export const POSTHOG_METRICS = ['bezoekers', 'paginaweergaven', 'wijzerStart', 'wijzerKlaar', 'winkelklikken'] as const;

export const SearchDay = z.object({ date: z.string(), klikken: z.number(), vertoningen: z.number() });
export type SearchDay = z.infer<typeof SearchDay>;
export const SEARCH_METRICS = ['klikken', 'vertoningen'] as const;

export const Comparison = z.object({
  metriek: z.string(),
  dag: z.string(),
  waarde: z.number(),
  gem7: z.number().nullable(),
  gem28: z.number().nullable(),
  verschil7Pct: z.number().nullable(),
  opvallend: z.enum(['hoger', 'lager']).nullable(),
});
export type Comparison = z.infer<typeof Comparison>;

export const QueryRow = z.object({
  zoekterm: z.string(),
  klikken: z.number(),
  vertoningen: z.number(),
  positie: z.number().nullable(),
});
export type QueryRow = z.infer<typeof QueryRow>;

export const Riser = z.object({ zoekterm: z.string(), nu: z.number(), ervoor: z.number(), nieuw: z.boolean() });
export type Riser = z.infer<typeof Riser>;

const Count = z.object({ key: z.string(), bezoekers: z.number() });

const part = <T extends z.ZodType>(value: T) =>
  z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), value }),
    z.object({ ok: z.literal(false), reden: z.string() }),
  ]);

export const Dagcijfers = z.object({
  versie: z.literal(1),
  gemaakt: z.string(),
  site: z.string(),
  posthog: part(
    z.object({
      dagen: z.array(PosthogDay),
      /** Today so far, at `tot` (the afternoon run); not part of the series. */
      vandaag: PosthogDay.extend({ tot: z.string() }).optional(),
      vergelijking: z.array(Comparison),
      /** Yesterday only. */
      bronnen: z.array(Count),
      landen: z.array(Count),
    }),
  ),
  google: part(
    z.object({
      dagen: z.array(SearchDay),
      vergelijking: z.array(Comparison),
      periode: z.object({ start: z.string(), end: z.string() }),
      topZoektermen: z.array(QueryRow),
      stijgers: z.array(Riser),
    }),
  ),
  bing: part(z.object({ dagen: z.array(SearchDay), vergelijking: z.array(Comparison) })),
});
export type Dagcijfers = z.infer<typeof Dagcijfers>;

export const isoDay = (time: number) => new Date(time).toISOString().slice(0, 10);

/** All dates from `from` up to and including `to` (YYYY-MM-DD, UTC arithmetic). */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) out.push(isoDay(t));
  return out;
}

/** One row per date in the range; a date without data gets zeros (no visits is a real zero). */
export function fillDays<T extends { date: string }>(rows: readonly T[], dates: readonly string[], empty: (date: string) => T): T[] {
  const byDate = new Map(rows.map((r) => [r.date, r]));
  return dates.map((d) => byDate.get(d) ?? empty(d));
}

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;
const mean = (xs: readonly number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * The last day of a series against the average of the 7 and 28 days before
 * it. `opvallend` only with enough history and a difference that is large
 * both in numbers and in proportion (ANOMALY).
 */
export function compareLastDay<T extends { date: string }, K extends keyof T & string>(
  days: readonly T[],
  metric: K,
): Comparison | null {
  const last = days.at(-1);
  if (!last) return null;
  const value = Number(last[metric]);
  const before = days.slice(0, -1).map((d) => Number(d[metric]));
  const prev7 = before.slice(-7);
  const prev28 = before.slice(-28);
  const gem7 = mean(prev7);
  const gem28 = mean(prev28);
  let opvallend: Comparison['opvallend'] = null;
  if (gem7 !== null && prev7.length >= ANOMALY.minHistoryDays) {
    const diff = value - gem7;
    const relative = gem7 === 0 ? Infinity : Math.abs(diff) / gem7;
    if (Math.abs(diff) >= ANOMALY.minAbsolute && relative >= ANOMALY.minRelative) opvallend = diff > 0 ? 'hoger' : 'lager';
  }
  return {
    metriek: metric,
    dag: last.date,
    waarde: value,
    gem7: gem7 === null ? null : round(gem7),
    gem28: gem28 === null ? null : round(gem28),
    verschil7Pct: gem7 ? round(((value - gem7) / gem7) * 100, 0) : null,
    opvallend,
  };
}

export function compareAll<T extends { date: string }>(days: readonly T[], metrics: readonly (keyof T & string)[]): Comparison[] {
  return metrics.map((m) => compareLastDay(days, m)).filter((c): c is Comparison => c !== null);
}

/** Queries with clearly more impressions than in the period before (RISER), most extra first. */
export function risers(now: readonly QueryRow[], before: readonly QueryRow[], n = 5): Riser[] {
  const earlier = new Map(before.map((r) => [r.zoekterm, r.vertoningen]));
  return now
    .map((r) => ({ zoekterm: r.zoekterm, nu: r.vertoningen, ervoor: earlier.get(r.zoekterm) ?? 0 }))
    .filter((r) => r.nu - r.ervoor >= RISER.minExtraImpressions && (r.ervoor === 0 || r.nu / r.ervoor >= RISER.minFactor))
    .sort((a, b) => b.nu - b.ervoor - (a.nu - a.ervoor) || a.zoekterm.localeCompare(b.zoekterm))
    .slice(0, n)
    .map((r) => ({ ...r, nieuw: r.ervoor === 0 }));
}

/** Top queries by clicks, then impressions. */
export function topQueries(rows: readonly QueryRow[], n = 10): QueryRow[] {
  return [...rows]
    .sort((a, b) => b.klikken - a.klikken || b.vertoningen - a.vertoningen || a.zoekterm.localeCompare(b.zoekterm))
    .slice(0, n)
    .map((r) => ({ ...r, positie: r.positie === null ? null : round(r.positie) }));
}
