/**
 * Current PassaHockey prices for curated sticks (owner's choice, 2026-10-19):
 * when a stick is sold at PassaHockey, the site and the stickwijzer use the
 * price the shop asks today instead of the brand's list price, which can be
 * much higher. The prices come from the PassaHockey product feed and are
 * refreshed by the weekly sync (src/catalog/imported/passaPrices.ts). Never
 * shown as a discount: the list price is only mentioned in the source label.
 */
import type { Product } from './types';

export type LivePrices = {
  /** YYYY-MM-DD: when the feed was read. */
  date: string;
  /** Lowest in-stock price per curated slug. */
  prices: Readonly<Record<string, number>>;
};

const euro = (value: number) =>
  `€${value.toFixed(2).replace('.', ',').replace(',00', '')}`;

export function withLivePrice(product: Product, live: LivePrices): Product {
  const price = live.prices[product.slug];
  if (
    price === undefined ||
    product.feedImport !== undefined ||
    !product.passaSportsProductUrl
  ) {
    return product;
  }
  const listPrice = product.priceIndicativeEur.value;
  const note =
    Math.abs(listPrice - price) >= 0.5
      ? ` Eerder vastgelegde richtprijs (adviesprijs of andere winkel): ${euro(listPrice)}.`
      : '';
  return {
    ...product,
    priceIndicativeEur: {
      value: price,
      source: 'partner-shop',
      sourceLabel: `Prijs bij PassaHockey volgens de productfeed op ${live.date}.${note}`,
      sourceUrl: product.passaSportsProductUrl,
      lastVerifiedAt: live.date,
    },
  };
}

/** Lowest current price per curated stick that links to a PassaHockey page. */
export function livePricesFromFeed(
  curated: readonly Product[],
  models: readonly { url: string; priceMin: number; inStock: boolean }[],
): Record<string, number> {
  const byUrl = new Map(models.filter((m) => m.inStock).map((m) => [m.url, m.priceMin]));
  const prices: Record<string, number> = {};
  for (const product of curated) {
    const url = product.passaSportsProductUrl?.split('?')[0];
    const price = url ? byUrl.get(url) : undefined;
    if (price !== undefined && price > 0) prices[product.slug] = price;
  }
  return prices;
}
