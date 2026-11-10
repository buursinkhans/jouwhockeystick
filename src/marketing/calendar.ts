/**
 * Season calendar of the marketing engine (docs/marketing/bouwplan-2.0.md,
 * fases 3 and 4). The moments and Push blocks of a market come from the site
 * configuration (marketing/sites/<site>.json); this module only resolves them
 * to dates. Pure: dates in, moments out; no clock inside.
 */
import type { MarketConfig } from './siteConfig';

export type Moment = MarketConfig['kalender'][number] & { van: string; tot: string };
export type PushBlock = MarketConfig['push'][number] & { van: string; tot: string };

const pad = (n: number) => String(n).padStart(2, '0');

/** Black Friday: the day after the fourth Thursday of November. */
export function blackFriday(year: number): string {
  const first = new Date(Date.UTC(year, 10, 1)).getUTCDay(); // 0 = Sunday
  const firstThursday = 1 + ((4 - first + 7) % 7);
  return `${year}-11-${pad(firstThursday + 22)}`;
}

/** The season year a date belongs to: a new one starts in `startMonth`. */
export const seasonYear = (date: string, startMonth: number) => {
  const y = Number(date.slice(0, 4));
  return Number(date.slice(5, 7)) >= startMonth ? y : y - 1;
};

/** A MM-DD of the configuration as a date in the season that starts in `seasonStart`. */
function inSeason(monthDay: string, seasonStart: number, startMonth: number): string {
  const month = Number(monthDay.slice(0, 2));
  return `${month >= startMonth ? seasonStart : seasonStart + 1}-${monthDay}`;
}

/**
 * A moment or block resolved to dates. "02-29" compares right as text in
 * every year, so "through the last day of February" needs no leap-year rule.
 */
function resolve<T extends { van: string; tot: string }>(x: T, seasonStart: number, startMonth: number): T {
  return { ...x, van: inSeason(x.van, seasonStart, startMonth), tot: inSeason(x.tot, seasonStart, startMonth) };
}

/** The moments of a market that run on a date. */
export function momentsOn(date: string, m: MarketConfig, startMonth: number): Moment[] {
  const s = seasonYear(date, startMonth);
  return m.kalender.map((x) => resolve(x, s, startMonth)).filter((x) => date >= x.van && date <= x.tot);
}

/** The Push block of a date, or null (then the week is Pulse; a Peak is only set by the owner). */
export function pushOn(date: string, m: MarketConfig, startMonth: number): PushBlock | null {
  const s = seasonYear(date, startMonth);
  return m.push.map((x) => resolve(x, s, startMonth)).find((x) => date >= x.van && date <= x.tot) ?? null;
}
