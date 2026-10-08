import type { Product } from '@/catalog/types';

/**
 * Article list items generated from the catalog, so prices and lengths in
 * articles always match the product pages. Prices are indicative.
 */
export function stickListItem(product: Product): string {
  const price = product.priceIndicativeEur.value.toFixed(2).replace('.', ',');
  const lengths = product.lengthsInches.value
    .map((length) => `${String(length).replace('.', ',')}"`)
    .join(', ');
  return `[${product.name}](/sticks/${product.slug}) — richtprijs €${price}, lengte ${lengths}`;
}

export function byPrice(a: Product, b: Product): number {
  return a.priceIndicativeEur.value - b.priceIndicativeEur.value;
}

export function formatEuro(value: number): string {
  return `€${Math.round(value)}`;
}
