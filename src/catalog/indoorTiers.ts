import { brandVerifiedCount } from '@/advice-engine/scoring';
import { isJuniorStick } from './similar';
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

/**
 * A few sticks to start with per price group (top of /zaalsticks): only
 * sticks that are not unavailable, those with the most specs from the brand
 * itself first, then the lower price. No popularity or fee plays a part.
 */
export function tierPicks(
  products: readonly Product[],
  tier: IndoorTier,
  limit = 3,
): Product[] {
  const ranked = products
    .filter((p) => inTier(p, tier) && p.stock.value !== 'unavailable')
    .sort(
      (a, b) =>
        brandVerifiedCount(b) - brandVerifiedCount(a) ||
        a.priceIndicativeEur.value - b.priceIndicativeEur.value,
    );
  // One stick per brand, so a group shows a real choice.
  const brands = new Set<string>();
  const picks: Product[] = [];
  for (const product of ranked) {
    if (picks.length === limit) break;
    if (brands.has(product.brand)) continue;
    brands.add(product.brand);
    picks.push(product);
  }
  // Most searches are by adults: at least one adult stick when the group has one.
  if (picks.length === limit && picks.every(isJuniorStick)) {
    const adult = ranked.find(
      (p) =>
        !isJuniorStick(p) &&
        !picks.slice(0, -1).some((q) => q.brand === p.brand),
    );
    if (adult) picks[limit - 1] = adult;
  }
  return picks;
}
