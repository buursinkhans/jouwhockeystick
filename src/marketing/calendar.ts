/**
 * Season calendar for social content (docs/marketing/bouwplan-2.0.md, fase 3),
 * for the Netherlands and Flanders. Only moments the handbook already uses
 * (docs/instagram.md §1 and §7) and the Push blocks the owner set on
 * 2026-11-10. Pure: dates in, moments out; no clock inside.
 */
export type Market = 'NL' | 'BE';

export type Moment = {
  id: string;
  /** Name as the market says it (NL "zaal", BE "indoor"). */
  naam: string;
  /** Inclusive YYYY-MM-DD range. */
  van: string;
  tot: string;
  /** Pillar of the brand platform it fits (docs/marketing/merkplatform.md). */
  pijler: 'maat' | 'spel' | 'zaal' | 'vergelijken';
};

/** A Push block: 2 to 6 weeks with one next step (the owner's method). */
export type PushBlock = { id: string; naam: string; van: string; tot: string; vervolgstap: string };

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** Black Friday: the day after the fourth Thursday of November. */
export function blackFriday(year: number): string {
  const first = new Date(Date.UTC(year, 10, 1)).getUTCDay(); // 0 = Sunday
  const firstThursday = 1 + ((4 - first + 7) % 7);
  return ymd(year, 11, firstThursday + 21 + 1);
}

/** The moments of one season year, which starts in August (field preparation) and ends in July. */
export function seasonMoments(seasonStartYear: number, market: Market): Moment[] {
  const y = seasonStartYear;
  const indoor = market === 'BE' ? 'Indoor' : 'Zaal';
  return [
    { id: 'veld-start-najaar', naam: 'Start veldseizoen', van: ymd(y, 8, 15), tot: ymd(y, 9, 30), pijler: 'maat' },
    // Through the last day of February: '02-29' compares right as text in every year.
    { id: 'zaalseizoen', naam: `${indoor}seizoen`, van: ymd(y, 10, 1), tot: ymd(y + 1, 2, 29), pijler: 'zaal' },
    { id: 'black-friday', naam: 'Black Friday', van: ymd(y, 11, 1), tot: ymd(y, 11, 30), pijler: 'vergelijken' },
    market === 'BE'
      // Flanders: Sinterklaas brings the presents on the morning of 6 December.
      ? { id: 'sinterklaas', naam: 'Sinterklaas (6 december, ochtend)', van: ymd(y, 11, 15), tot: ymd(y, 12, 6), pijler: 'maat' }
      : { id: 'sinterklaas', naam: 'Sinterklaas (pakjesavond 5 december)', van: ymd(y, 11, 15), tot: ymd(y, 12, 5), pijler: 'maat' },
    { id: 'kerst', naam: 'Kerst', van: ymd(y, 12, 6), tot: ymd(y, 12, 24), pijler: 'maat' },
    { id: 'veld-start-voorjaar', naam: 'Veldseizoen weer van start', van: ymd(y + 1, 2, 15), tot: ymd(y + 1, 3, 31), pijler: 'spel' },
  ];
}

/** The Push blocks the owner set (bouwplan 2.0): indoor mid-November to mid-December, field mid-August to mid-September. */
export function pushBlocks(seasonStartYear: number, market: Market): PushBlock[] {
  const y = seasonStartYear;
  const indoor = market === 'BE' ? 'Indoor' : 'Zaal';
  return [
    { id: 'veld-push', naam: 'Veldseizoen-Push', van: ymd(y, 8, 15), tot: ymd(y, 9, 15), vervolgstap: 'Doe de stickwijzer' },
    { id: 'indoor-push', naam: 'Indoor-Push', van: ymd(y, 11, 15), tot: ymd(y, 12, 15), vervolgstap: `Kies je ${indoor.toLowerCase()}stick` },
  ];
}

/** The season year a date belongs to (August starts a new one). */
export const seasonYear = (date: string) => {
  const y = Number(date.slice(0, 4));
  return Number(date.slice(5, 7)) >= 8 ? y : y - 1;
};

/** Moments that run on a date, in the market. */
export function momentsOn(date: string, market: Market): Moment[] {
  return seasonMoments(seasonYear(date), market).filter((m) => date >= m.van && date <= m.tot);
}

/** The Push block of a date, or null (then the week is Pulse; a Peak is only set by the owner). */
export function pushOn(date: string, market: Market): PushBlock | null {
  return pushBlocks(seasonYear(date), market).find((b) => date >= b.van && date <= b.tot) ?? null;
}
