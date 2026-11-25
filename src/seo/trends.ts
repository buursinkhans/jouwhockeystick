/**
 * Google Trends exports (hand-made CSV files) as a season signal for the SEO report
 * (docs/seo-market-intelligence-plan.md, Phase 2). Pure functions: reading and
 * checking a CSV, the yearly pattern, the expected effect of the season on impressions
 * and the next wave. The importer (scripts/trends-import.ts) writes the files, the
 * monthly script reads them.
 *
 * A Trends figure is a relative index (0 to 100), never a number of searches, and
 * it is rounded to whole numbers. So:
 * - a small term (an index of a few points) is read as a direction over the whole
 *   period, never month by month;
 * - 0 means "too little to show", not "nobody searched";
 * - two exports are only comparable through a term that is in both (the anchor,
 *   `hockeystick`); themes of small terms are compared on their pattern, not their size.
 */
import { z } from 'zod';

/** The anchor of the reference export (owner decision 2026-11-25). */
export const ANCHOR_TERM = 'hockeystick';

export const MIN_COMPLETE_YEARS = 2;
/** A series with a mean index from this on is read per month; below it only as a direction. */
export const RELIABLE_MEAN = 20;
export const DIRECTION_MEAN = 5;
/** Months in which an average year rises at least this many index points (mean = 100) count as the start of a wave. */
export const WAVE_STEP = 15;
/** Preparing starts this many weeks before a wave (a hypothesis of the plan, tested after a year of data). */
export const PREPARE_WEEKS = { from: 8, to: 4 } as const;
/** An export older than this many days is "verouderd". */
export const STALE_DAYS = 100;

const DAY_MS = 86_400_000;

// ---------------------------------------------------------------- Stored format

const Point = z.tuple([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.number().int().min(0).max(100)]);
export const TrendTerm = z.object({ term: z.string().min(1), punten: z.array(Point).min(1) });
export type TrendTerm = z.infer<typeof TrendTerm>;

export const TrendExport = z.object({
  versie: z.literal(1),
  /** Theme of the comparison, for example "referentie", "maat", "merken", "zaal", "kopen". */
  thema: z.string().min(1),
  /** The reference export holds the anchor term; a theme export holds small terms without it. */
  rol: z.enum(['referentie', 'thema']),
  regio: z.string().min(2),
  zoektype: z.string().min(1),
  categorie: z.string().min(1),
  granulariteit: z.enum(['maand', 'week', 'dag']),
  periode: z.object({ start: z.string(), end: z.string() }),
  /** YYYY-MM-DD: the day the owner made the export. */
  geexporteerd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bron: z.string(),
  termen: z.array(TrendTerm).min(1),
  /** Terms that were dropped, with the reason (for example "altijd 0"). */
  genegeerd: z.array(z.object({ term: z.string(), reden: z.string() })),
});
export type TrendExport = z.infer<typeof TrendExport>;

// ---------------------------------------------------------------- Reading a CSV

export type Parsed =
  | { ok: true; granulariteit: TrendExport['granulariteit']; regioLabel: string | null; termen: TrendTerm[]; genegeerd: TrendExport['genegeerd'] }
  | { ok: false; reden: string };

/** One CSV line into cells; quoted cells may hold commas and doubled quotes. */
function cells(line: string): string[] {
  const out: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i] as string;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      out.push(cell.trim());
      cell = '';
    } else cell += ch;
  }
  out.push(cell.trim());
  return out;
}

const DATE_HEADERS = new Set(['time', 'tijd', 'week', 'maand', 'month', 'dag', 'day', 'date', 'datum']);

/** "2021-11" and "2021-11-01" are both read as a day; anything else is not a date this reader knows. */
function isoDate(text: string): string | null {
  const full = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (full) return text;
  const month = text.match(/^(\d{4})-(\d{2})$/);
  return month ? `${text}-01` : null;
}

export function granularityOf(dates: readonly string[]): TrendExport['granulariteit'] {
  const gaps = dates
    .slice(1)
    .map((d, i) => (Date.parse(`${d}T00:00:00Z`) - Date.parse(`${dates[i]}T00:00:00Z`)) / DAY_MS)
    .sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)] ?? 0;
  return median >= 27 ? 'maand' : median >= 6 ? 'week' : 'dag';
}

/**
 * Reads a Google Trends CSV: the plain form ("Time","term",...), the form with a few lines of
 * preamble ("Categorie: Alle categorieën") and headers with a region ("term: (Nederland)").
 * Says why a file is not usable instead of guessing.
 */
export function parseTrendsCsv(text: string): Parsed {
  const clean = text.replace(/^﻿/, '').trim();
  if (clean === '') return { ok: false, reden: 'Het bestand is leeg.' };
  if (/^\s*<(!doctype|html)/i.test(clean)) return { ok: false, reden: 'Dit is een webpagina, geen CSV. Download het bestand met het pijltje bij "Interesse in de loop van de tijd".' };

  const lines = clean.split(/\r?\n/);
  const headerAt = lines.findIndex((line) => DATE_HEADERS.has((cells(line)[0] ?? '').toLowerCase()));
  if (headerAt < 0) return { ok: false, reden: 'Geen kolom met datums gevonden (Tijd, Time, Week of Maand). Is dit de export "Interesse in de loop van de tijd"?' };

  const header = cells(lines[headerAt] as string);
  let regioLabel: string | null = null;
  const names = header.slice(1).map((name) => {
    const match = name.match(/^(.*):\s*\(([^)]*)\)\s*$/);
    if (match) regioLabel = match[2] ?? null;
    return (match ? (match[1] ?? '') : name).trim();
  });
  if (names.length === 0 || names.some((n) => n === '')) return { ok: false, reden: 'De kop van het bestand mist zoektermen.' };
  if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return { ok: false, reden: 'Een zoekterm staat twee keer in het bestand.' };

  const dates: string[] = [];
  const columns: number[][] = names.map(() => []);
  for (const line of lines.slice(headerAt + 1)) {
    if (line.trim() === '') continue;
    const row = cells(line);
    const date = isoDate(row[0] ?? '');
    if (!date) return { ok: false, reden: `Onbekend datumformaat: "${(row[0] ?? '').slice(0, 20)}". Verwacht JJJJ-MM-DD.` };
    if (row.length !== names.length + 1) return { ok: false, reden: `Op de regel van ${date} ontbreken waarden.` };
    dates.push(date);
    for (let i = 0; i < names.length; i += 1) {
      // "<1" is an index below 1: it is stored as 0.
      const raw = (row[i + 1] ?? '').startsWith('<') ? '0' : (row[i + 1] ?? '');
      if (!/^\d+$/.test(raw)) return { ok: false, reden: `Geen getal bij "${names[i]}" op ${date}: "${(row[i + 1] ?? '').slice(0, 12)}".` };
      (columns[i] as number[]).push(Math.min(100, Number(raw)));
    }
  }
  if (dates.length < 8) return { ok: false, reden: 'Te weinig datapunten (minder dan 8) voor een seizoenspatroon.' };
  if (dates.some((d, i) => i > 0 && d <= (dates[i - 1] as string))) return { ok: false, reden: 'De datums staan niet op volgorde of komen dubbel voor.' };

  const termen: TrendTerm[] = [];
  const genegeerd: TrendExport['genegeerd'] = [];
  names.forEach((term, i) => {
    const values = columns[i] as number[];
    if (values.every((v) => v === 0)) genegeerd.push({ term, reden: 'altijd 0 (te weinig zoekvolume, of verkeerd gespeld)' });
    else termen.push({ term, punten: dates.map((d, k) => [d, values[k] as number] as [string, number]) });
  });
  if (termen.length === 0) return { ok: false, reden: 'Alle termen staan overal op 0: er valt niets te lezen.' };
  return { ok: true, granulariteit: granularityOf(dates), regioLabel, termen, genegeerd };
}

/** A key that says "the same comparison": the same theme, terms, period and settings. */
export function exportKey(e: Pick<TrendExport, 'thema' | 'regio' | 'zoektype' | 'categorie' | 'periode'> & { termen: readonly { term: string }[] }): string {
  const terms = e.termen.map((t) => t.term.toLowerCase()).sort().join('+');
  return [e.thema, e.regio, e.zoektype, e.categorie, e.periode.start.slice(0, 7), e.periode.end.slice(0, 7), terms].join('|');
}

export type ImportVerdict = { action: 'nieuw' | 'vervangen' | 'dubbel'; reden: string };

/** A second import of the same comparison is refused; a newer export of it replaces the old one. */
export function importVerdict(incoming: TrendExport, existing: readonly TrendExport[]): ImportVerdict {
  const same = existing.find((e) => exportKey(e) === exportKey(incoming));
  if (!same) return { action: 'nieuw', reden: 'Nog niet eerder geïmporteerd.' };
  if (incoming.geexporteerd <= same.geexporteerd) return { action: 'dubbel', reden: `Deze vergelijking is al geïmporteerd (export van ${same.geexporteerd}).` };
  return { action: 'vervangen', reden: `Nieuwere export van dezelfde vergelijking (was ${same.geexporteerd}).` };
}

// ---------------------------------------------------------------- Patterns

export type Reliability = 'goed' | 'richting' | 'te klein';

/** "goed": read per month. "richting": only the pattern over the whole period. "te klein": do not use. */
export function reliabilityOf(values: readonly number[]): Reliability {
  if (values.length === 0) return 'te klein';
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const zeros = values.filter((v) => v === 0).length / values.length;
  if (mean >= RELIABLE_MEAN && zeros === 0) return 'goed';
  if (mean >= DIRECTION_MEAN && zeros <= 0.2) return 'richting';
  return 'te klein';
}

/** Monthly means of a series (weekly and daily points are averaged); months are keyed YYYY-MM. */
export function monthlyMeans(points: readonly (readonly [string, number])[]): Map<string, number> {
  const sums = new Map<string, { sum: number; n: number }>();
  for (const [date, value] of points) {
    const key = date.slice(0, 7);
    const entry = sums.get(key) ?? { sum: 0, n: 0 };
    entry.sum += value;
    entry.n += 1;
    sums.set(key, entry);
  }
  return new Map([...sums].map(([key, { sum, n }]) => [key, sum / n]));
}

export type Profile = {
  /** Twelve numbers, January first, with the mean of the year at 100. */
  index: number[];
  /** The calendar years that went into it (only complete years). */
  jaren: number[];
};

/**
 * The yearly pattern from the complete calendar years before the month of the export (the
 * month that is still running is never used). Null with fewer than MIN_COMPLETE_YEARS.
 */
export function seasonProfile(points: readonly (readonly [string, number])[], runningMonth: string): Profile | null {
  const months = monthlyMeans(points);
  const years = new Set([...months.keys()].map((k) => Number(k.slice(0, 4))));
  const complete = [...years].filter((year) =>
    Array.from({ length: 12 }, (_, m) => `${year}-${String(m + 1).padStart(2, '0')}`).every((k) => months.has(k) && k < runningMonth),
  );
  if (complete.length < MIN_COMPLETE_YEARS) return null;
  const perMonth = Array.from({ length: 12 }, (_, m) => {
    const values = complete.map((year) => months.get(`${year}-${String(m + 1).padStart(2, '0')}`) as number);
    return values.reduce((a, b) => a + b, 0) / values.length;
  });
  const mean = perMonth.reduce((a, b) => a + b, 0) / 12;
  if (mean === 0) return null;
  return { index: perMonth.map((v) => Math.round((v / mean) * 100)), jaren: complete.sort((a, b) => a - b) };
}

/** The sum of all terms of a theme export per date: the same scale, so a sum is allowed. */
export function themeSeries(terms: readonly TrendTerm[]): [string, number][] {
  const sums = new Map<string, number>();
  for (const term of terms) for (const [date, value] of term.punten) sums.set(date, (sums.get(date) ?? 0) + value);
  return [...sums].sort(([a], [b]) => a.localeCompare(b));
}

export function peakMonths(profile: Profile, n = 3): number[] {
  return profile.index
    .map((value, i) => ({ value, month: i + 1 }))
    .sort((a, b) => b.value - a.value || a.month - b.month)
    .slice(0, n)
    .map((x) => x.month)
    .sort((a, b) => a - b);
}

// ---------------------------------------------------------------- Season effect

/** The mean pattern value over the days of a period (each day takes the value of its month). */
export function seasonLevel(profile: Profile, period: { start: string; end: string }): number {
  let total = 0;
  let days = 0;
  for (let t = Date.parse(`${period.start}T00:00:00Z`); t <= Date.parse(`${period.end}T00:00:00Z`); t += DAY_MS) {
    total += profile.index[new Date(t).getUTCMonth()] as number;
    days += 1;
  }
  return days === 0 ? 0 : total / days;
}

/** How much the season alone is expected to change impressions: the level of this period over the one before. */
export function expectedChange(profile: Profile, now: { start: string; end: string }, before: { start: string; end: string }): number | null {
  const previous = seasonLevel(profile, before);
  return previous > 0 ? seasonLevel(profile, now) / previous : null;
}

export type Wave = { maand: string; wekenTot: number; voorbereidenVanaf: string; voorbereidenTot: string };

const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

/**
 * The next wave: the first month after today in which an average year rises at least
 * WAVE_STEP points above the month before. Preparing starts PREPARE_WEEKS ahead of the
 * first day of that month (a hypothesis to test, not a rule).
 */
export function nextWave(profile: Profile, today: string): Wave | null {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  for (let step = 1; step <= 12; step += 1) {
    const index = (month - 1 + step) % 12;
    const previous = (index + 11) % 12;
    if ((profile.index[index] as number) - (profile.index[previous] as number) < WAVE_STEP) continue;
    const y = year + Math.floor((month - 1 + step) / 12);
    const first = `${y}-${String(index + 1).padStart(2, '0')}-01`;
    const weeks = Math.round((Date.parse(`${first}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / (7 * DAY_MS));
    return { maand: first.slice(0, 7), wekenTot: weeks, voorbereidenVanaf: addDays(first, -PREPARE_WEEKS.from * 7), voorbereidenTot: addDays(first, -PREPARE_WEEKS.to * 7) };
  }
  return null;
}

export const isStale = (exported: string, today: string) => (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${exported}T00:00:00Z`)) / DAY_MS > STALE_DAYS;

// ---------------------------------------------------------------- Report part

export const SeasonTheme = z.object({
  thema: z.string(),
  termen: z.number(),
  betrouwbaarheid: z.enum(['goed', 'richting', 'te klein']),
  piekmaanden: z.array(z.number()),
  profiel: z.array(z.number()).length(12),
  geexporteerd: z.string(),
});
export type SeasonTheme = z.infer<typeof SeasonTheme>;

export const Season = z.object({
  bron: z.string(),
  geexporteerd: z.string(),
  verouderd: z.boolean(),
  /** The factor the season alone is expected to change impressions with, this period over the one before. */
  verwachteVerandering: z.number().nullable(),
  /** What non-brand impressions really did (this period over the one before), when there was a previous period. */
  werkelijkeVerandering: z.number().nullable(),
  /** The real change with the season taken out: real over expected. */
  gecorrigeerd: z.number().nullable(),
  volgendeGolf: z.object({ maand: z.string(), wekenTot: z.number(), voorbereidenVanaf: z.string(), voorbereidenTot: z.string() }).nullable(),
  /** The pattern of the reference term (mean of the year = 100) and the themes. */
  profiel: z.array(z.number()).length(12),
  themas: z.array(SeasonTheme),
});
export type Season = z.infer<typeof Season>;

/** What the monthly script needs from the files: the reference profile and the theme profiles. */
export type SeasonInput = {
  profile: Profile;
  geexporteerd: string;
  themas: SeasonTheme[];
};

/** The profile of every usable export: the reference term and, per theme, the sum of its terms. */
export function seasonFromExports(exports: readonly TrendExport[]): SeasonInput | null {
  const reference = [...exports].filter((e) => e.rol === 'referentie').sort((a, b) => b.geexporteerd.localeCompare(a.geexporteerd))[0];
  const anchor = reference?.termen.find((t) => t.term.toLowerCase() === ANCHOR_TERM);
  if (!reference || !anchor) return null;
  const running = reference.geexporteerd.slice(0, 7);
  const profile = seasonProfile(anchor.punten, running);
  if (!profile) return null;
  const themas: SeasonTheme[] = [];
  const latestPerTheme = new Map<string, TrendExport>();
  for (const e of exports) {
    if (e.rol !== 'thema') continue;
    const seen = latestPerTheme.get(e.thema);
    if (!seen || e.geexporteerd > seen.geexporteerd) latestPerTheme.set(e.thema, e);
  }
  for (const e of latestPerTheme.values()) {
    const series = themeSeries(e.termen);
    const themeProfile = seasonProfile(series, e.geexporteerd.slice(0, 7));
    if (!themeProfile) continue;
    themas.push({
      thema: e.thema,
      termen: e.termen.length,
      betrouwbaarheid: reliabilityOf(series.map(([, v]) => v)),
      piekmaanden: peakMonths(themeProfile),
      profiel: themeProfile.index,
      geexporteerd: e.geexporteerd,
    });
  }
  return { profile, geexporteerd: reference.geexporteerd, themas: themas.sort((a, b) => a.thema.localeCompare(b.thema)) };
}

export type SeasonArgs = {
  period: { start: string; end: string };
  previousPeriod: { start: string; end: string };
  /** Non-brand impressions in this period and in the one before (Search Console). */
  impressionsNow: number;
  impressionsBefore: number;
  today: string;
};

/** The season part of the report: expected, real and corrected change, the next wave and the patterns. */
export function buildSeason(input: SeasonInput, args: SeasonArgs): Season {
  const expected = expectedChange(input.profile, args.period, args.previousPeriod);
  const real = args.impressionsBefore > 0 ? args.impressionsNow / args.impressionsBefore : null;
  return {
    bron: `Google Trends, export van ${input.geexporteerd}, relatieve index (geen zoekaantallen)`,
    geexporteerd: input.geexporteerd,
    verouderd: isStale(input.geexporteerd, args.today),
    verwachteVerandering: expected === null ? null : Math.round(expected * 100) / 100,
    werkelijkeVerandering: real === null ? null : Math.round(real * 100) / 100,
    gecorrigeerd: expected !== null && real !== null ? Math.round((real / expected) * 100) / 100 : null,
    volgendeGolf: nextWave(input.profile, args.today),
    profiel: input.profile.index,
    themas: input.themas,
  };
}
