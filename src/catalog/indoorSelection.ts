import {
  findShorterSize,
  getSizeAdvice,
  type SizeAdvice,
} from '@/advice-engine/sizeAdvice';
import type { Product } from './types';

/**
 * A first selection of indoor sticks: a filter on size and budget, not an
 * advice. It ranks nothing beyond price, so it never claims one stick is
 * the best fit — that is what the (field) stickwijzer does with its rules.
 */

export type IndoorPlayer = 'adult' | 'child';

export const INDOOR_BUDGETS = {
  tot_50: { label: 'Tot €50', maxEur: 50 },
  '50_100': { label: '€50–100', maxEur: 100 },
  '100_200': { label: '€100–200', maxEur: 200 },
  meer_200: { label: 'Meer dan €200', maxEur: Number.POSITIVE_INFINITY },
  geen: { label: 'Geen voorkeur', maxEur: Number.POSITIVE_INFINITY },
} as const;
export type IndoorBudget = keyof typeof INDOOR_BUDGETS;

/** Adult indoor sticks come in these lengths in our catalog. */
export const ADULT_INDOOR_LENGTHS = [36.5, 37.5] as const;

export type IndoorSelectionInput = {
  player: IndoorPlayer;
  /** Required for a child: the length advice is based on it. */
  heightCm?: number;
  budget: IndoorBudget;
};

export type IndoorMatch = {
  product: Product;
  /** The advised length this stick is available in. */
  sizeInch: number;
  /** True when it only matches the second size of a borderline length advice. */
  alternativeSize: boolean;
};

export type IndoorSelection = {
  sizeAdvice: SizeAdvice | null;
  /** The lengths we looked for, in order of preference. */
  sizes: number[];
  matches: IndoorMatch[];
  /**
   * Only for a child when nothing exists in the advised size: sticks one size
   * shorter (never longer), shown separately and with a warning — the same
   * rule the stickwijzer uses.
   */
  shorterSizeMatches: IndoorMatch[];
  /** Why the list is empty, when it is. */
  noMatchReason: 'size' | 'budget' | null;
};

function sizesFor(input: IndoorSelectionInput): {
  sizes: number[];
  sizeAdvice: SizeAdvice | null;
} {
  if (input.player === 'adult' || input.heightCm === undefined) {
    return { sizes: [...ADULT_INDOOR_LENGTHS], sizeAdvice: null };
  }
  const sizeAdvice = getSizeAdvice(input.heightCm);
  const sizes =
    sizeAdvice.alternativeInch === undefined
      ? [sizeAdvice.primaryInch]
      : [sizeAdvice.primaryInch, sizeAdvice.alternativeInch];
  return { sizes, sizeAdvice };
}

export function selectIndoorSticks(
  products: Product[],
  input: IndoorSelectionInput,
): IndoorSelection {
  const { sizes, sizeAdvice } = sizesFor(input);
  const maxEur = INDOOR_BUDGETS[input.budget].maxEur;

  const inSize: IndoorMatch[] = [];
  for (const product of products) {
    const sizeInch = sizes.find((size) =>
      product.lengthsInches.value.includes(size),
    );
    if (sizeInch !== undefined) {
      inSize.push({
        product,
        sizeInch,
        // For adults both lengths are equally valid, so neither is an alternative.
        alternativeSize: sizeAdvice !== null && sizeInch !== sizes[0],
      });
    }
  }

  const matches = inSize
    .filter((match) => match.product.priceIndicativeEur.value <= maxEur)
    .sort(
      (a, b) =>
        Number(a.alternativeSize) - Number(b.alternativeSize) ||
        a.product.priceIndicativeEur.value - b.product.priceIndicativeEur.value,
    );

  const shorterSizeMatches: IndoorMatch[] = [];
  if (inSize.length === 0 && sizeAdvice !== null) {
    for (const product of products) {
      const shorter = findShorterSize(product, sizeAdvice);
      if (shorter !== undefined && product.priceIndicativeEur.value <= maxEur) {
        shorterSizeMatches.push({
          product,
          sizeInch: shorter,
          alternativeSize: true,
        });
      }
    }
    shorterSizeMatches.sort(
      (a, b) =>
        a.product.priceIndicativeEur.value - b.product.priceIndicativeEur.value,
    );
  }

  return {
    sizeAdvice,
    sizes,
    matches,
    shorterSizeMatches,
    noMatchReason:
      matches.length > 0 ? null : inSize.length === 0 ? 'size' : 'budget',
  };
}
