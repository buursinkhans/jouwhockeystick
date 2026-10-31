import { describe, expect, it } from 'vitest';
import { IMPORTED_SHOES, SHOE_LISTINGS } from './imported';
import { getCuratedShoes, getImportedShoes, getShoeListings, getShoes } from './index';
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

  it('only has listings for models in the generated file or the checked catalog, each with a read date', () => {
    const slugs = new Set([...IMPORTED_SHOES, ...getCuratedShoes()].map((s) => s.slug));
    for (const [slug, listings] of Object.entries(SHOE_LISTINGS)) {
      expect(slugs.has(slug), slug).toBe(true);
      for (const listing of listings) expect(() => shoeListingSchema.parse(listing), slug).not.toThrow();
    }
  });
});

describe('hand-checked shoe models (phase 1b, decision log 2026-10-31)', () => {
  const curated = getCuratedShoes();

  it('has 10 to 15 models, field and indoor, junior and senior', () => {
    expect(curated.length).toBeGreaterThanOrEqual(10);
    expect(curated.length).toBeLessThanOrEqual(15);
    for (const category of ['veld', 'zaal'] as const) expect(curated.some((s) => s.category.value === category), category).toBe(true);
    for (const age of ['junior', 'senior'] as const) expect(curated.some((s) => s.ageGroup === age), age).toBe(true);
  });

  it('takes field or indoor, and every other claim, from the brand page', () => {
    for (const shoe of curated) {
      expect(shoe.category.value, shoe.slug).not.toBe('onbekend');
      for (const [key, claim] of claims(shoe)) {
        if (claim.value !== 'onbekend') expect(claim.source, `${shoe.slug}.${key}`).toBe('brand-website');
      }
      expect(shoe.eans.length, shoe.slug).toBeGreaterThan(0);
      expect(shoe.evidenceLimits.length, shoe.slug).toBeGreaterThan(0);
    }
  });

  it('confirms a surface only when the brand names that surface', () => {
    for (const shoe of curated) {
      if (shoe.surfaceWater.value === 'bevestigd') expect(shoe.surfaceWater.sourceLabel, shoe.slug).toMatch(/water/i);
      if (shoe.surfaceSand.value === 'bevestigd') expect(shoe.surfaceSand.sourceLabel, shoe.slug).toMatch(/sand|zand/i);
      expect(shoe.surfaceSemiWaterHybrid.value, shoe.slug).toBe('onbekend');
    }
    // "All surfaces" is no water or sand claim (Grays Raid 2.0 and Stealth).
    for (const slug of ['grays-raid-2-0', 'grays-stealth']) {
      const shoe = curated.find((s) => s.slug === slug)!;
      expect([shoe.surfaceWater.value, shoe.surfaceSand.value], slug).toEqual(['onbekend', 'onbekend']);
    }
  });

  it('confirms non-marking only for an indoor shoe whose brand says so', () => {
    for (const shoe of curated) {
      const claim = shoe.indoorNonMarking;
      if (claim.value !== 'bevestigd') continue;
      expect(shoe.category.value, shoe.slug).toBe('zaal');
      expect(claim.sourceLabel, shoe.slug).toMatch(/non-marking/i);
    }
    expect(curated.filter((s) => s.indoorNonMarking.value === 'bevestigd').map((s) => s.slug)).toEqual(['brabo-force-zaal', 'brabo-tribute-zaal']);
  });

  it('hides a feed model that is a checked model and gives its shop listings to the checked one', () => {
    const curatedEans = new Set(curated.flatMap((s) => s.eans));
    expect(getImportedShoes().filter((s) => s.eans.some((e) => curatedEans.has(e))).map((s) => s.slug)).toEqual([]);
    const hidden = IMPORTED_SHOES.filter((s) => s.eans.some((e) => curatedEans.has(e)));
    expect(hidden.length).toBeGreaterThanOrEqual(curated.length);
    // Two Osaka colour articles in the feed are one checked model, with one listing per shop.
    const kai = getShoeListings('osaka-kai-mk1-pro-tour');
    expect(kai.map((l) => l.shop)).toEqual(['passasports']);
    expect(kai[0]!.colourPages).toBeGreaterThanOrEqual(2);
    for (const shoe of curated) expect(getShoeListings(shoe.slug).length, shoe.slug).toBeGreaterThan(0);
  });
});
