import type { Product } from '@/catalog/types';

type LengthBand = {
  minCm: number;
  maxCm: number;
  sizes: readonly [number, ...number[]];
};

const ADULT_MIN_CM = 163;

const LAST_BAND: LengthBand = { minCm: 193, maxCm: 210, sizes: [38.5] };

/**
 * Indicative height-to-stick-length mapping (spec §3B). Not a medical or
 * federation standard. Brand size charts differ by up to 2–3 inch (Grays
 * advises longer for children, other charts shorter), so every single-size
 * band also names a neighbouring size as a fit. For children that is always
 * the shorter one (never buy "op de groei"); from adult height the nearer
 * one. See decision log 2026-10-13.
 */
export const LENGTH_GUIDE: readonly LengthBand[] = [
  { minCm: 95, maxCm: 107, sizes: [22, 24] },
  { minCm: 108, maxCm: 115, sizes: [24, 26] },
  { minCm: 116, maxCm: 122, sizes: [27, 28] },
  { minCm: 123, maxCm: 127, sizes: [29] },
  { minCm: 128, maxCm: 132, sizes: [30] },
  { minCm: 133, maxCm: 137, sizes: [31] },
  { minCm: 138, maxCm: 142, sizes: [32] },
  { minCm: 143, maxCm: 147, sizes: [33] },
  { minCm: 148, maxCm: 154, sizes: [34] },
  { minCm: 155, maxCm: 162, sizes: [35] },
  { minCm: 163, maxCm: 184, sizes: [36.5] },
  { minCm: 185, maxCm: 192, sizes: [37.5] },
  LAST_BAND,
];

/**
 * The other sizes that can fit within a single-size band, as the stickwijzer
 * offers them (the length table on /kennis is generated from this).
 */
export function alsoFitsInch(band: LengthBand): number[] {
  if (band.sizes.length > 1) return [];
  const index = LENGTH_GUIDE.indexOf(band);
  const shorter = LENGTH_GUIDE[index - 1]?.sizes.at(-1);
  const longer =
    band.minCm >= ADULT_MIN_CM ? LENGTH_GUIDE[index + 1]?.sizes[0] : undefined;
  return [shorter, longer].filter((inch) => inch !== undefined);
}

export type SizeAdvice = {
  primaryInch: number;
  alternativeInch?: number;
  confidence: 'high' | 'medium' | 'low';
  /** Why there is (or isn't) an alternative size. */
  basis: 'single' | 'two_sizes' | 'borderline' | 'neighbour';
  /** Set when the player's current stick length differs from the advice by more than one inch. */
  differsFromCurrentInch?: number;
};

export type SizeMatch = 'primary' | 'alternative' | 'none';

export function getSizeAdvice(
  heightCm: number,
  options: { heightUncertain?: boolean; currentLengthInch?: number } = {},
): SizeAdvice {
  // Heights are validated to 95–210 cm, so a band always matches; the last band is only a type-safe fallback.
  const bandIndex = LENGTH_GUIDE.findIndex((band) => heightCm <= band.maxCm);
  const band = LENGTH_GUIDE[bandIndex] ?? LAST_BAND;
  const previous = LENGTH_GUIDE[bandIndex - 1];
  const next = LENGTH_GUIDE[bandIndex + 1];
  const [firstSize, secondSize] = band.sizes;

  let primaryInch = firstSize;
  let alternativeInch: number | undefined;
  let basis: SizeAdvice['basis'] = 'single';

  if (secondSize !== undefined) {
    const upperHalf = heightCm > (band.minCm + band.maxCm) / 2;
    primaryInch = upperHalf ? secondSize : firstSize;
    alternativeInch = upperHalf ? firstSize : secondSize;
    basis = 'two_sizes';
  } else {
    // A neighbouring size also fits: for children only the shorter one.
    const upperHalf =
      band.minCm >= ADULT_MIN_CM && heightCm > (band.minCm + band.maxCm) / 2;
    const neighbour =
      (upperHalf ? next?.sizes[0] : previous?.sizes.at(-1)) ??
      previous?.sizes.at(-1);
    if (neighbour !== undefined) {
      alternativeInch = neighbour;
      basis = heightCm <= band.minCm ? 'borderline' : 'neighbour';
    }
  }

  const confidence: SizeAdvice['confidence'] = options.heightUncertain
    ? 'low'
    : basis === 'single' || basis === 'neighbour'
      ? 'high'
      : 'medium';

  const advice: SizeAdvice = { primaryInch, confidence, basis };
  if (alternativeInch !== undefined) {
    advice.alternativeInch = alternativeInch;
  }
  if (
    options.currentLengthInch !== undefined &&
    Math.abs(options.currentLengthInch - primaryInch) > 1
  ) {
    advice.differsFromCurrentInch = options.currentLengthInch;
  }
  return advice;
}

export function matchSize(product: Product, sizeAdvice: SizeAdvice): SizeMatch {
  const lengths = product.lengthsInches.value;
  if (lengths.includes(sizeAdvice.primaryInch)) {
    return 'primary';
  }
  if (
    sizeAdvice.alternativeInch !== undefined &&
    lengths.includes(sizeAdvice.alternativeInch)
  ) {
    return 'alternative';
  }
  return 'none';
}

/**
 * A stick up to one size shorter than advised, available when nothing in the
 * advised size exists. Never longer: buying "op de groei" is what the length
 * advice warns against.
 */
export function findShorterSize(
  product: Product,
  sizeAdvice: SizeAdvice,
): number | undefined {
  const shorter = product.lengthsInches.value.filter(
    (length) =>
      length < sizeAdvice.primaryInch && sizeAdvice.primaryInch - length <= 1.5,
  );
  return shorter.length > 0 ? Math.max(...shorter) : undefined;
}
