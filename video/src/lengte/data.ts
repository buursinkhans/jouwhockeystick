// Every number in the length videos comes from LENGTH_GUIDE, the same table
// the stickwijzer and /kennis/hockeystick-lengte-tabel use, so the videos can
// never disagree with the site. Only the example heights are chosen here.
import {
  LENGTH_GUIDE,
  alsoFitsInch,
} from '../../../src/advice-engine/sizeAdvice';

export const CM_PER_INCH = 2.54;

/** FIH Rules of Hockey: a stick may be at most 105 cm long (field and indoor). */
export const FIH_MAX_STICK_CM = 105;

/** Children's heights shown as worked examples (one per step of the table). */
const EXAMPLE_HEIGHTS_CM = [120, 140, 170] as const;

type Band = (typeof LENGTH_GUIDE)[number];

export function formatInch(inch: number): string {
  return String(inch).replace('.', ',');
}

export function formatMeters(cm: number): string {
  return (cm / 100).toFixed(2).replace('.', ',');
}

export function bandFor(heightCm: number): Band {
  const band =
    LENGTH_GUIDE.find((candidate) => heightCm <= candidate.maxCm) ??
    LENGTH_GUIDE.at(-1);
  if (!band) throw new Error('LENGTH_GUIDE is empty');
  return band;
}

export type Example = {
  heightCm: number;
  sizes: readonly number[];
  /** The shortest advised size: the one drawn, never buy "op de groei". */
  drawnInch: number;
};

export const EXAMPLES: Example[] = EXAMPLE_HEIGHTS_CM.map((heightCm) => {
  const band = bandFor(heightCm);
  return { heightCm, sizes: band.sizes, drawnInch: Math.min(...band.sizes) };
});

export function sizesLabel(sizes: readonly number[]): string {
  return `${sizes.map(formatInch).join(' of ')} inch`;
}

export type TableRow = { height: string; size: string; alsoFits: string };

export const TABLE_ROWS: TableRow[] = LENGTH_GUIDE.map((band, index) => {
  const isLast = index === LENGTH_GUIDE.length - 1;
  const also = alsoFitsInch(band);
  return {
    height: isLast ? `vanaf ${band.minCm} cm` : `${band.minCm}–${band.maxCm} cm`,
    size: sizesLabel(band.sizes),
    alsoFits: also.length > 0 ? sizesLabel(also) : '–',
  };
});

const ADULT_FROM_CM = 163;

export const ADULT_ROWS = LENGTH_GUIDE.filter(
  (band) => band.minCm >= ADULT_FROM_CM,
).map((band, index, rows) => ({
  height:
    index === rows.length - 1
      ? `vanaf ${formatMeters(band.minCm)} m`
      : `${formatMeters(band.minCm)}–${formatMeters(band.maxCm)} m`,
  size: sizesLabel(band.sizes),
}));

/** A child's height for the "too long" scene. */
export const DOUBT_HEIGHT_CM = 140;
export const DOUBT_INCH = Math.min(...bandFor(DOUBT_HEIGHT_CM).sizes);

/** Two sizes up from the doubt example: what "buying to grow into" looks like. */
export function sizeStepsUp(heightCm: number, steps: number): number {
  const index = LENGTH_GUIDE.indexOf(bandFor(heightCm));
  const band =
    LENGTH_GUIDE[Math.min(index + steps, LENGTH_GUIDE.length - 1)] ??
    bandFor(heightCm);
  return Math.min(...band.sizes);
}

/** Index in TABLE_ROWS of the row that contains this height. */
export function rowIndexFor(heightCm: number): number {
  return LENGTH_GUIDE.indexOf(bandFor(heightCm));
}
