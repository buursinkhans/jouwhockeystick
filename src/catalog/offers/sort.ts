/**
 * Order and freshness of shop offers, without any price data, so the size
 * choice in the browser can re-sort without loading the catalog
 * (docs/spec/prijsvergelijking.md §2).
 */
import { RETAILERS, type RetailerId } from '@/lib/retailers';

export type Offer = {
  retailer: RetailerId;
  /** Shop's product page; the tracking link is built in src/lib/retailers.ts. */
  productUrl: string;
  /** Current feed price incl. btw; null when the feed gave none. */
  priceEur: number | null;
  /** Shipping for one stick from the shop's public terms; null = unknown. */
  shippingEur: number | null;
  inStock: boolean;
  /** Lengths in inches in stock, when the feed says; absent = unknown. */
  lengths?: readonly number[];
  /** YYYY-MM-DD the price was read; null without a price. */
  readAt: string | null;
};

/** Older prices lose their amount: only the button stays (rule 5 of the spec). */
export const MAX_PRICE_AGE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A price we may show: read at most MAX_PRICE_AGE_DAYS before `now`. */
export function isPriceFresh(offer: Offer, now: Date): boolean {
  if (offer.priceEur === null || !offer.readAt) return false;
  // Whole calendar days: read on the 13th is still current on the 27th.
  const today = Date.parse(now.toISOString().slice(0, 10));
  const age = (today - Date.parse(offer.readAt)) / DAY_MS;
  return age >= -1 && age <= MAX_PRICE_AGE_DAYS;
}

/**
 * The date to judge freshness by in the browser (code review 2026-11-08).
 * Stick pages are static: the server rendered them with the build date. After
 * mount the browser's own date takes over when it is later, so a price that
 * has passed 14 days since the build loses its amount and its badge. A
 * browser clock behind the build date is ignored: it could only show more.
 */
export function freshnessNow(serverIso: string, browserMs: number): Date {
  const server = Date.parse(serverIso);
  return new Date(Number.isFinite(server) && browserMs <= server ? server : browserMs);
}

/** Price plus shipping; unknown shipping counts as 0 here and says so on the page. */
export const totalPrice = (offer: Offer) => (offer.priceEur ?? 0) + (offer.shippingEur ?? 0);

/** True when the shop has this length, or when the feed does not say which lengths it has. */
export function hasLength(offer: Offer, size: number | null): boolean {
  if (size === null || !offer.lengths) return true;
  return offer.lengths.some((length) => Math.abs(length - size) < 0.01);
}

/**
 * The order of "Waar te koop" (spec §2 rule 1):
 * 1. shops with a current price that have the chosen length, by total price;
 * 2. shops with a current price without that length (or out of stock);
 * 3. shops without a price or with a price older than 14 days.
 * Same total: the price read most recently first, then by name. Never by
 * commission, network or cookie length.
 */
export function sortOffers(offers: readonly Offer[], { size, now }: { size: number | null; now: Date }): Offer[] {
  const group = (o: Offer) => (!isPriceFresh(o, now) ? 2 : o.inStock && hasLength(o, size) ? 0 : 1);
  return [...offers].sort(
    (a, b) =>
      group(a) - group(b) ||
      (group(a) < 2 ? totalPrice(a) - totalPrice(b) : 0) ||
      (b.readAt ?? '').localeCompare(a.readAt ?? '') ||
      RETAILERS[a.retailer].label.localeCompare(RETAILERS[b.retailer].label),
  );
}

/**
 * Whether the top row of a sorted list gets the "Laagste prijs" badge (owner,
 * 2026-11-05): a current price, in stock in the chosen length, known shipping,
 * and strictly lower than at least one other shop with a current price in
 * stock. A tie, one shop or unknown shipping: no badge. Price only, never fee.
 */
export function hasLowestBadge(sorted: readonly Offer[], { size, now }: { size: number | null; now: Date }): boolean {
  const comparable = sorted.filter((o) => isPriceFresh(o, now) && o.inStock && hasLength(o, size));
  const [top, ...rest] = comparable;
  if (!top || top !== sorted[0] || top.shippingEur === null || rest.length === 0) return false;
  return rest.every((o) => totalPrice(top) < totalPrice(o));
}

/** Lowest total of the shops with a current price (in this length when given); null when none. */
export function lowestTotal(offers: readonly Offer[], { size, now }: { size: number | null; now: Date }): number | null {
  const totals = offers.filter((o) => isPriceFresh(o, now) && o.inStock && hasLength(o, size)).map(totalPrice);
  return totals.length ? Math.min(...totals) : null;
}

/** What the feeds say about one length across the shops (UX phase 4, 2026-11-08). */
export type SizeStock = {
  /** Shops with a current price that list this length in stock. */
  inSize: number;
  /** Shops with a current price in stock whose feed gives no lengths. */
  unknown: number;
  /** Shops with a current price in stock (any length). */
  stocked: number;
  /** All shops in the block. */
  total: number;
  /** Read dates of the shops counted in `inSize`. */
  readAt: string[];
};

/**
 * Stock in the advised length, only from feeds read at most 14 days ago: an
 * older feed says nothing about today. Never a delivery promise; the shop
 * confirms stock after the click.
 */
export function sizeStock(offers: readonly Offer[], { size, now }: { size: number; now: Date }): SizeStock {
  const stocked = offers.filter((o) => isPriceFresh(o, now) && o.inStock);
  const inSize = stocked.filter((o) => o.lengths && hasLength(o, size));
  return {
    inSize: inSize.length,
    unknown: stocked.filter((o) => !o.lengths).length,
    stocked: stocked.length,
    total: offers.length,
    readAt: inSize.flatMap((o) => (o.readAt ? [o.readAt] : [])),
  };
}
