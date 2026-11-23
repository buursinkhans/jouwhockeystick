import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '@/catalog';
import { specSource } from '@/components/brand/BrandStickTable';
import {
  BRAND_PAGES,
  MIN_GROUP,
  MIN_STICKS,
  brandPageOf,
  evaluateBrandPage,
  groupOf,
  indexableBrandPages,
  type BrandPageDefinition,
} from './brandPages';
import type { BowProfile, ExperienceLevel, Product } from './types';

const base = getProductBySlug('grays-jb8-composite')!;
const now = new Date();
const definition: BrandPageDefinition = { slug: 'test', brand: base.brand };

type Patch = { level?: ExperienceLevel; bow?: BowProfile; carbon?: number; price?: number; lengths?: number[] } & Partial<Product>;

/** A copy of a real stick with other values, so the gate can be tested without the catalog. */
function stick(slug: string, patch: Patch = {}): Product {
  const { level, bow, carbon, price, lengths, ...rest } = patch;
  return {
    ...base,
    slug,
    name: slug,
    experienceLevel: level ? { ...base.experienceLevel, value: level } : base.experienceLevel,
    bowProfile: bow ? { ...base.bowProfile!, value: bow } : base.bowProfile,
    carbonPercentage: carbon === undefined ? base.carbonPercentage : { ...base.carbonPercentage!, value: carbon },
    priceIndicativeEur: price === undefined ? base.priceIndicativeEur : { ...base.priceIndicativeEur, value: price },
    lengthsInches: lengths ? { ...base.lengthsInches, value: lengths } : base.lengthsInches,
    ...rest,
  };
}
const brandOf = (products: Product[]) => () => products;

describe('the gate against thin brand pages', () => {
  const five = (extra: Patch[] = []) =>
    ['a', 'b', 'c', 'd', 'e'].map((slug, i) => stick(slug, { level: (['beginner', 'gevorderd', 'ervaren'] as const)[i % 3]!, carbon: 10 + i * 20, ...(extra[i] ?? {}) }));

  it('passes with five complete sticks on three levels', () => {
    const e = evaluateBrandPage(definition, now, brandOf(five()));
    expect(e.indexable).toBe(true);
    expect(e.problems).toEqual([]);
    expect(e.sticks).toHaveLength(MIN_STICKS);
  });

  it('passes with one level when there are two bow profiles', () => {
    const sticks = ['a', 'b', 'c', 'd', 'e'].map((slug, i) => stick(slug, { level: 'gevorderd', bow: i % 2 ? 'lowbow' : 'midbow', carbon: 20 + i }));
    expect(evaluateBrandPage(definition, now, brandOf(sticks)).indexable).toBe(true);
  });

  it('fails with one level and one bow profile', () => {
    const sticks = ['a', 'b', 'c', 'd', 'e'].map((slug) => stick(slug, { level: 'gevorderd', bow: 'lowbow' }));
    const e = evaluateBrandPage(definition, now, brandOf(sticks));
    expect(e.indexable).toBe(false);
    expect(e.problems.join(' ')).toContain('niveaus');
  });

  it('fails with fewer than five sticks that have all data and a photo, and says why one is left out', () => {
    const sticks = five([{}, {}, {}, {}, { imageUrl: undefined }]);
    const e = evaluateBrandPage(definition, now, brandOf(sticks));
    expect(e.indexable).toBe(false);
    expect(e.sticks).toHaveLength(4);
    expect(e.notComplete[0]?.reasons.join(' ')).toContain('foto');
  });

  it('never counts a stick from the feed, whatever its data', () => {
    const feed = stick('feed', { feedImport: { feed: 'passahockey', importedAt: '2026-11-01' } });
    const e = evaluateBrandPage(definition, now, brandOf([...five().slice(0, 4), feed]));
    expect(e.indexable).toBe(false);
    expect(e.sticks.map((p) => p.slug)).not.toContain('feed');
  });

  it('wants a current shop price or an indicative price with a source of its own', () => {
    const guess = { ...base.priceIndicativeEur, source: 'editorial-estimate' as const };
    const sticks = five().map((p, i) => (i === 0 ? { ...p, slug: 'no-offers', priceIndicativeEur: guess } : p));
    const e = evaluateBrandPage(definition, now, brandOf(sticks));
    expect(e.indexable).toBe(false);
    expect(e.problems.join(' ')).toContain('zonder actuele prijs');
  });

  it('gives a group its own table from three sticks, lists smaller groups together and keeps the order of a range', () => {
    const sticks = [
      stick('s1', { level: 'ervaren', carbon: 90 }),
      stick('s2', { level: 'beginner', carbon: 10 }),
      stick('s3', { level: 'gevorderd', carbon: 40 }),
      stick('j1', { level: 'beginner', carbon: 0, lengths: [30, 32] }),
      stick('j2', { level: 'beginner', carbon: 0, lengths: [28] }),
    ];
    const e = evaluateBrandPage(definition, now, brandOf(sticks));
    expect(MIN_GROUP).toBe(3);
    expect(e.groups.map((g) => g.key)).toEqual(['veld-senior']);
    expect(e.groups[0]?.sticks.map((p) => p.slug)).toEqual(['s2', 's3', 's1']);
    expect(e.others.map((p) => p.slug).sort()).toEqual(['j1', 'j2']);
    expect(groupOf(sticks[3]!)).toBe('veld-junior');
  });
});

describe('the brand pages in the catalog today', () => {
  it('has the five brands of batch 1, all indexable', () => {
    expect(BRAND_PAGES.map((b) => b.slug)).toEqual(['grays', 'brabo', 'princess', 'jdh', 'osaka']);
    expect(indexableBrandPages().map((e) => e.definition.slug)).toEqual(['grays', 'brabo', 'princess', 'jdh', 'osaka']);
  });

  it('has no page for a brand that is not in the list, and one for JDH and Osaka', () => {
    expect(brandPageOf('Stag')).toBeUndefined();
    expect(brandPageOf('adidas')).toBeUndefined();
    expect(brandPageOf('JDH')?.definition.slug).toBe('jdh');
    expect(brandPageOf('Osaka')?.definition.slug).toBe('osaka');
  });

  it('puts Grays in three groups, Brabo in one and Princess mostly junior', () => {
    const byBrand = Object.fromEntries(BRAND_PAGES.map((b) => [b.slug, evaluateBrandPage(b)]));
    expect(byBrand['grays']!.groups.map((g) => g.key)).toEqual(['veld-senior', 'veld-junior', 'zaal-senior']);
    expect(byBrand['brabo']!.groups.map((g) => g.key)).toEqual(['veld-senior']);
    expect(byBrand['princess']!.groups.map((g) => g.key)).toEqual(['veld-junior']);
    expect(byBrand['princess']!.others.length).toBeGreaterThan(0);
  });

  it('puts JDH and Osaka in one senior field group each, with the junior sticks under the others', () => {
    for (const slug of ['jdh', 'osaka']) {
      const e = evaluateBrandPage(BRAND_PAGES.find((b) => b.slug === slug)!);
      expect(e.groups.map((g) => g.key)).toEqual(['veld-senior']);
      expect(e.others.length).toBeGreaterThan(0);
    }
  });

  it('shows the partner shop as the source of the three Osaka sticks that came from the feed, until osakaworld.com has been checked (about 2027-01-23)', () => {
    const e = evaluateBrandPage(BRAND_PAGES.find((b) => b.slug === 'osaka')!);
    const fromFeed = e.sticks.filter((s) => /stk00(262|239|400)/.test(s.slug));
    expect(fromFeed).toHaveLength(3);
    for (const p of fromFeed) expect(specSource(p)).toBe('Partnerwinkel');
  });

  it('lists the sticks with a gap with the reason, and never has a feed stick in a table', () => {
    const grays = evaluateBrandPage(BRAND_PAGES[0]!);
    expect(grays.notComplete.map((n) => n.product.slug)).toContain('grays-db2xi-dynabow-indoor');
    for (const e of BRAND_PAGES.map((b) => evaluateBrandPage(b))) {
      for (const p of e.sticks) expect(p.feedImport).toBeUndefined();
    }
  });
});
