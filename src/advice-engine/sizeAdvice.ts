import type { Product } from '@/catalog/types';

type LengthBand = { minCm: number; maxCm: number; sizes: readonly [number, ...number[]] };

const LAST_BAND: LengthBand = { minCm: 163, maxCm: 210, sizes: [36.5] };

/**
 * Indicative height-to-stick-length mapping (spec §3B). Not a medical or
 * federation standard; edge cases are reported as a range, never as a
 * single precise answer.
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
  LAST_BAND,
];

export type SizeAdvice = {
  primaryInch: number;
  alternativeInch?: number;
  confidence: 'high' | 'medium' | 'low';
  /** Why there is (or isn't) an alternative size. */
  basis: 'single' | 'two_sizes' | 'borderline';
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
  } else if (heightCm <= band.minCm && previous) {
    alternativeInch = previous.sizes.at(-1);
    basis = 'borderline';
  } else if (heightCm >= band.maxCm && next) {
    alternativeInch = next.sizes[0];
    basis = 'borderline';
  }

  const confidence: SizeAdvice['confidence'] = options.heightUncertain
    ? 'low'
    : alternativeInch !== undefined
      ? 'medium'
      : 'high';

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
  if (sizeAdvice.alternativeInch !== undefined && lengths.includes(sizeAdvice.alternativeInch)) {
    return 'alternative';
  }
  return 'none';
}

/**
 * A stick up to one size shorter than advised, available when nothing in the
 * advised size exists. Never longer: buying "op de groei" is what the length
 * advice warns against.
 */
export function findShorterSize(product: Product, sizeAdvice: SizeAdvice): number | undefined {
  const shorter = product.lengthsInches.value.filter(
    (length) => length < sizeAdvice.primaryInch && sizeAdvice.primaryInch - length <= 1.5,
  );
  return shorter.length > 0 ? Math.max(...shorter) : undefined;
}
