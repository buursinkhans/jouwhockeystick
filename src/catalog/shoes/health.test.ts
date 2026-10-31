import { describe, expect, it } from 'vitest';
import { SHOE_LISTINGS } from './imported';
import { getCuratedShoes, getImportedShoes, getShoes } from './index';
import { SHOE_CONTENT_PROPERTIES, shoeListingSchema, shoeSchema, type Shoe } from './types';

/**
 * Checks on the shoe catalog data (curated and generated), like
 * src/catalog/health.test.ts for sticks. Decision log 2026-10-31.
 */
const all = getShoes({ includeImported: true });

/** Every filled-in property of a shoe: name and value as stored. */
function claims(shoe: Shoe): [string, { value: unknown; source?: string; sourceUrl?: string; lastVerifiedAt?: string }][] {
  return (['category', ...SHOE_CONTENT_PROPERTIES, 'sizesAndWidths'] as const).map((key) => [key, shoe[key]]);
}

describe('shoe catalog health', () => {
  it('every model, curated and imported, matches the schema', () => {
    for (const shoe of all) expect(() => shoeSchema.parse(shoe), shoe.slug).not.toThrow();
  });

  it('has no duplicate slugs and no EAN on two models', () => {
    const slugs = all.map((s) => s.slug);
    expect(slugs.filter((s, i) => slugs.indexOf(s) !== i)).toEqual([]);
    const owner = new Map<string, string>();
    const shared: string[] = [];
    for (const shoe of all) {
      for (const ean of shoe.eans) {
        if (owner.has(ean) && owner.get(ean) !== shoe.slug) shared.push(`${ean}: ${owner.get(ean)} / ${shoe.slug}`);
        owner.set(ean, shoe.slug);
      }
    }
    expect(shared).toEqual([]);
  });

  it('gives every known property a source and a check date; brand claims link to the brand page', () => {
    for (const shoe of all) {
      for (const [key, claim] of claims(shoe)) {
        if (claim.value === 'onbekend') continue;
        expect(claim.source, `${shoe.slug}.${key}`).toBeDefined();
        expect(claim.lastVerifiedAt, `${shoe.slug}.${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (claim.source === 'brand-website') expect(claim.sourceUrl, `${shoe.slug}.${key}`).toBeDefined();
      }
    }
  });

  it('never confirms a field surface for an indoor shoe', () => {
    for (const shoe of all.filter((s) => s.category.value === 'zaal')) {
      expect(shoe.surfaceWater.value, shoe.slug).not.toBe('bevestigd');
      expect(shoe.surfaceSand.value, shoe.slug).not.toBe('bevestigd');
      expect(shoe.surfaceSemiWaterHybrid.value, shoe.slug).not.toBe('bevestigd');
    }
  });

  it('knows nothing about an imported model beyond the shop data, and marks it for noindex', () => {
    for (const shoe of getImportedShoes()) {
      expect(shoe.feedImport, shoe.slug).toBeDefined();
      for (const property of SHOE_CONTENT_PROPERTIES) expect(shoe[property].value, `${shoe.slug}.${property}`).toBe('onbekend');
      if (shoe.category.value !== 'onbekend') expect(shoe.category, shoe.slug).toMatchObject({ source: 'partner-shop' });
    }
  });

  it('never marks a hand-checked model as a feed import', () => {
    for (const shoe of getCuratedShoes()) expect(shoe.feedImport, shoe.slug).toBeUndefined();
  });

  it('only has listings for models in the catalog, each with a read date', () => {
    const slugs = new Set(all.map((s) => s.slug));
    for (const [slug, listings] of Object.entries(SHOE_LISTINGS)) {
      expect(slugs.has(slug), slug).toBe(true);
      for (const listing of listings) expect(() => shoeListingSchema.parse(listing), slug).not.toThrow();
    }
  });
});
