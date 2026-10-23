import { brandVerifiedCount } from '@/advice-engine/scoring';
import { isJuniorStick } from './similar';
import type { Product } from './types';

/**
 * A few sticks to start with from a group (e.g. a price group on /zaalsticks
 * or a level on /sticks). Only sticks that are not unavailable; those with
 * the most specs from the brand itself first, then the lower price; one per
 * brand; and at least one adult stick when the group has one. No popularity
 * or fee plays a part.
 */
export function pickVaried(group: readonly Product[], limit = 3): Product[] {
  const ranked = group
    .filter((p) => p.stock.value !== 'unavailable')
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
