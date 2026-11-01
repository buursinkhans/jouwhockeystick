/**
 * Shop offers for a hockey shoe, in the same shape as stick offers
 * (src/catalog/offers), so "Waar te koop" sorts and dates them by the same
 * rules: total price incl. shipping first, no amount after 14 days, never by
 * commission. Shoe sizes are not inch lengths: they stay out of `Offer`
 * (no size buttons) and are listed apart, only as the feed confirms them per
 * size (decision log 2026-11-01).
 */
import type { Offer } from '@/catalog/offers/sort';
import { SHIPPING, shippingCostEur } from '@/lib/retailers';
import { getShoeListings } from './index';
import type { Shoe, ShoeListing } from './types';

export function getShoeOffers(shoe: Shoe): Offer[] {
  return getShoeListings(shoe.slug).map((listing) => ({
    retailer: listing.shop,
    productUrl: listing.url,
    priceEur: listing.priceEur,
    shippingEur: shippingCostEur(SHIPPING[listing.shop], listing.priceEur),
    inStock: listing.inStock,
    readAt: listing.readAt,
  }));
}

/** Sizes in stock per shop, as the feed lists them per size; shops without that list are left out. */
export function sizesInStockByShop(shoe: Shoe): { shop: ShoeListing['shop']; sizes: readonly string[]; readAt: string }[] {
  return getShoeListings(shoe.slug)
    .filter((listing) => listing.inStock && listing.sizesInStock.length > 0)
    .map((listing) => ({ shop: listing.shop, sizes: listing.sizesInStock, readAt: listing.readAt }));
}

/** The shop photo of a model: its own, else the first shop listing's. */
export function shoeImageUrl(shoe: Shoe): string | undefined {
  return shoe.imageUrl ?? getShoeListings(shoe.slug).find((listing) => listing.imageUrl)?.imageUrl;
}
