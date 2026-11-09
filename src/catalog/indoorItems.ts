import { cardPrice, getOffers } from './offers';
import { isFeedImport } from './index';
import type { IndoorItem } from './indoorFinder';
import type { Product } from './types';

/**
 * The light list the /zaalsticks finder filters in the browser, built on the
 * server (2026-11-09). The price is the one on the card (cardPrice), so a
 * filter and the card it shows never disagree.
 */
export function indoorItem(product: Product, now: Date): IndoorItem {
  const price = cardPrice(getOffers(product), product.priceIndicativeEur.value, now);
  return {
    slug: product.slug,
    checked: !isFeedImport(product),
    priceEur: price.totalEur,
    priceKind: price.kind,
    lengths: product.lengthsInches.value,
  };
}
