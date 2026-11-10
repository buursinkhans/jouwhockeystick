import { getOffers, isPriceFresh, type Offer } from './offers';
import { pickVaried } from './picks';
import { getShoeOffers } from './shoes/offers';
import type { Shoe } from './shoes/types';
import type { Product } from './types';

/**
 * Picks for a page that compares shop prices (/black-friday-hockey, decision
 * log 2026-11-10): only items with a current, in-stock price, so every card
 * shows a real comparison. No discount, popularity or fee plays a part.
 */

/** Shops with a current (max. 14 days) price for an item in stock. */
export const pricedOffers = (offers: readonly Offer[], now: Date) =>
  offers.filter((offer) => offer.inStock && isPriceFresh(offer, now));

/** Sticks priced at two or more shops, then pickVaried (one per brand, most brand specs first). */
export function comparableSticks(products: readonly Product[], now: Date, limit = 3): Product[] {
  return pickVaried(
    products.filter((product) => pricedOffers(getOffers(product), now).length >= 2),
    limit,
  );
}

/** Shoes with at least one current shop price: most priced shops first, then by name; one per brand. */
export function pricedShoes(
  shoes: readonly Shoe[],
  now: Date,
  limit = 3,
  offersOf: (shoe: Shoe) => readonly Offer[] = getShoeOffers,
): Shoe[] {
  const ranked = shoes
    .map((shoe) => ({ shoe, count: pricedOffers(offersOf(shoe), now).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || `${a.shoe.brand} ${a.shoe.model}`.localeCompare(`${b.shoe.brand} ${b.shoe.model}`, 'nl'));
  const brands = new Set<string>();
  const picks: Shoe[] = [];
  for (const { shoe } of ranked) {
    if (picks.length === limit) break;
    if (brands.has(shoe.brand)) continue;
    brands.add(shoe.brand);
    picks.push(shoe);
  }
  return picks;
}
