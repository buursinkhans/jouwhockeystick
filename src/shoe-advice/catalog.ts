import { getCuratedShoes, getShoeListings } from '@/catalog/shoes';
import { getShoeOffers } from '@/catalog/shoes/offers';
import type { ShoeCatalog } from './types';

/**
 * The catalog the schoenenwijzer advises from: the hand-checked shoes only.
 * Feed models know nothing about surface or fit, so they can never be a
 * confirmed match (decision log 2026-11-01).
 */
export function shoeAdviceCatalog(): ShoeCatalog {
  return {
    shoes: getCuratedShoes(),
    listingsOf: (shoe) => getShoeListings(shoe.slug),
    offersOf: getShoeOffers,
  };
}
