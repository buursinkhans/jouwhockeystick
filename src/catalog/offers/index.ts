/**
 * Shop offers kept apart from the product data (docs/spec/prijsvergelijking.md
 * §3.2). For now only which Plutosport page sells a stick; prices from the
 * Plutosport feed are not shown yet (phase 1).
 */
import type { Product } from '../types';

export type PlutosportMatch = {
  /** Product page on plutosport.nl; the tracking link is built in src/lib/retailers.ts. */
  productUrl: string;
  /** How the feed script matched it (both count as 'zeker'). */
  method: 'ean' | 'naam';
};

export type PlutosportMatches = {
  /** YYYY-MM-DD: when the feed was read. */
  date: string;
  matches: Readonly<Record<string, PlutosportMatch>>;
};

/** Adds the Plutosport page to a stick that has a 'zeker' match. */
export function withPlutosport(product: Product, plutosport: PlutosportMatches): Product {
  const match = plutosport.matches[product.slug];
  return match ? { ...product, plutosportProductUrl: match.productUrl } : product;
}
