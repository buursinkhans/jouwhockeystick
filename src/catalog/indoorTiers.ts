import { pickVaried } from './picks';
import type { Product } from './types';

/**
 * Price groups for indoor sticks, shared by /zaalsticks and the budget
 * article (/kennis/zaalstick-budget), so both use the same limits.
 */
export type IndoorTier = {
  id: 'low' | 'mid' | 'high';
  heading: string;
  /** Mid-sentence form, e.g. "onder €50". */
  label: string;
  min: number;
  /** Exclusive upper limit; none for the top group. */
  max?: number;
};

export const INDOOR_TIERS: readonly IndoorTier[] = [
  { id: 'low', heading: 'Onder €50', label: 'onder €50', min: 0, max: 50 },
  {
    id: 'mid',
    heading: 'Van €50 tot €100',
    label: 'tussen €50 en €100',
    min: 50,
    max: 100,
  },
  { id: 'high', heading: 'Vanaf €100', label: 'vanaf €100', min: 100 },
];

export function inTier(product: Product, tier: IndoorTier): boolean {
  const price = product.priceIndicativeEur.value;
  return price >= tier.min && (tier.max === undefined || price < tier.max);
}

/** A few sticks to start with per price group (top of /zaalsticks), see pickVaried. */
export function tierPicks(
  products: readonly Product[],
  tier: IndoorTier,
  limit = 3,
): Product[] {
  return pickVaried(
    products.filter((p) => inTier(p, tier)),
    limit,
  );
}
