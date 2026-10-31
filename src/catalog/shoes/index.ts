import { IMPORTED_SHOES, SHOE_IMPORT_DATE, SHOE_LISTINGS } from './imported';
import { CURATED_SHOES } from './products';
import type { Shoe, ShoeListing } from './types';

export { SHOE_IMPORT_DATE };

/**
 * The hockey-shoe catalog: hand-checked models (src/catalog/shoes/products/)
 * and the models generated from the shop feeds (imported.ts, weekly sync).
 * Separate from the stick catalog (src/catalog/index.ts).
 */
export function getCuratedShoes(): readonly Shoe[] {
  return CURATED_SHOES;
}

export function getImportedShoes(): readonly Shoe[] {
  return IMPORTED_SHOES;
}

/** Curated first; imported models only when asked, like sticks. */
export function getShoes({ includeImported = false }: { includeImported?: boolean } = {}): Shoe[] {
  return includeImported ? [...CURATED_SHOES, ...IMPORTED_SHOES] : [...CURATED_SHOES];
}

export function getShoeBySlug(slug: string): Shoe | undefined {
  return getShoes({ includeImported: true }).find((shoe) => shoe.slug === slug);
}

/** A model generated from the feeds: noindex until enriched by hand (decision log 2026-10-17, 2026-10-31). */
export const isShoeFeedImport = (shoe: Shoe) => shoe.feedImport !== undefined;

/** The shops' feed listings of a model (price, stock, sizes, read date). */
export function getShoeListings(slug: string): readonly ShoeListing[] {
  return SHOE_LISTINGS[slug] ?? [];
}
