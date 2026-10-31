import { mergeListings } from './feedImport';
import { IMPORTED_SHOES, SHOE_IMPORT_DATE, SHOE_LISTINGS } from './imported';
import { CURATED_SHOES } from './products';
import type { Shoe, ShoeListing } from './types';

export { SHOE_IMPORT_DATE };

/**
 * The hockey-shoe catalog: hand-checked models (src/catalog/shoes/products/)
 * and the models generated from the shop feeds (imported.ts, weekly sync).
 * Separate from the stick catalog (src/catalog/index.ts).
 */

const curatedByEan = new Map<string, string>();
for (const shoe of CURATED_SHOES) for (const ean of shoe.eans) curatedByEan.set(ean, shoe.slug);

/** The checked model a feed model belongs to (shared EAN), if any. */
const curatedSlugOf = (shoe: Shoe) => shoe.eans.map((ean) => curatedByEan.get(ean)).find(Boolean);

/**
 * Feed models that are not a checked model. Until the next sync rebuilds
 * imported.ts, a feed model sharing an EAN with a checked one is hidden here
 * and its listings go to the checked model, so no shoe shows twice.
 */
const VISIBLE_IMPORTED: readonly Shoe[] = IMPORTED_SHOES.filter((shoe) => !curatedSlugOf(shoe));

const LISTINGS: Record<string, readonly ShoeListing[]> = (() => {
  const result: Record<string, ShoeListing[]> = {};
  for (const [slug, listings] of Object.entries(SHOE_LISTINGS)) {
    const imported = IMPORTED_SHOES.find((shoe) => shoe.slug === slug);
    const target = (imported && curatedSlugOf(imported)) ?? slug;
    result[target] = [...(result[target] ?? []), ...listings];
  }
  return Object.fromEntries(Object.entries(result).map(([slug, listings]) => [slug, mergeListings(listings)]));
})();

export function getCuratedShoes(): readonly Shoe[] {
  return CURATED_SHOES;
}

export function getImportedShoes(): readonly Shoe[] {
  return VISIBLE_IMPORTED;
}

/** Curated first; imported models only when asked, like sticks. */
export function getShoes({ includeImported = false }: { includeImported?: boolean } = {}): Shoe[] {
  return includeImported ? [...CURATED_SHOES, ...VISIBLE_IMPORTED] : [...CURATED_SHOES];
}

export function getShoeBySlug(slug: string): Shoe | undefined {
  return getShoes({ includeImported: true }).find((shoe) => shoe.slug === slug);
}

/** A model generated from the feeds: noindex until enriched by hand (decision log 2026-10-17, 2026-10-31). */
export const isShoeFeedImport = (shoe: Shoe) => shoe.feedImport !== undefined;

/** The shops' feed listings of a model (price, stock, sizes, read date). */
export function getShoeListings(slug: string): readonly ShoeListing[] {
  return LISTINGS[slug] ?? [];
}
