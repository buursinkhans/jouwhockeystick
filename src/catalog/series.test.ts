import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '@/catalog';
import {
  CARBON_MIN_POINTS,
  PRICE_MIN_EUR,
  SERIES,
  differingDimensions,
  evaluateSeries,
  indexableSeries,
  seriesForProduct,
  type SeriesDefinition,
} from './series';
import type { Product } from './types';

const base = getProductBySlug('grays-jb6-composite')!;

/** A copy of a real stick with other values, so the gate can be tested without the catalog. */
function stick(slug: string, patch: Partial<Product> & { carbon?: number; price?: number; level?: Product['experienceLevel']['value']; bow?: NonNullable<Product['bowProfile']>['value']; lengths?: number[] }): Product {
  const { carbon, price, level, bow, lengths, ...rest } = patch;
  return {
    ...base,
    slug,
    name: slug,
    carbonPercentage: carbon === undefined ? base.carbonPercentage : { ...base.carbonPercentage!, value: carbon },
    priceIndicativeEur: price === undefined ? base.priceIndicativeEur : { ...base.priceIndicativeEur, value: price },
    experienceLevel: level === undefined ? base.experienceLevel : { ...base.experienceLevel, value: level },
    bowProfile: bow === undefined ? base.bowProfile : { ...base.bowProfile!, value: bow },
    lengthsInches: lengths === undefined ? base.lengthsInches : { ...base.lengthsInches, value: lengths },
    ...rest,
  };
}

const definition = (slugs: string[]): SeriesDefinition => ({
  slug: 'test',
  brand: base.brand,
  discipline: 'veld',
  noun: 'sticks',
  name: 'test',
  members: slugs.map((slug) => ({ slug, label: slug.toUpperCase() })),
});
const lookup = (products: Product[]) => (slug: string) => products.find((p) => p.slug === slug);

describe('differingDimensions', () => {
  it('counts carbon from the threshold and price from both thresholds', () => {
    const a = stick('a', { carbon: 40, price: 100 });
    expect(differingDimensions(a, stick('b', { carbon: 40 + CARBON_MIN_POINTS - 1, price: 100 }))).toEqual([]);
    expect(differingDimensions(a, stick('b', { carbon: 40 + CARBON_MIN_POINTS, price: 100 }))).toEqual(['carbon']);
    expect(differingDimensions(a, stick('b', { carbon: 40, price: 100 + PRICE_MIN_EUR - 1 }))).toEqual([]);
    expect(differingDimensions(a, stick('b', { carbon: 40, price: 100 + PRICE_MIN_EUR }))).toEqual(['prijs']);
    // A large amount that is a small share of the price is no difference.
    expect(differingDimensions(stick('c', { price: 1000 }), stick('d', { price: 1050 }))).toEqual([]);
  });
});

describe('the gate against thin pages (evaluateSeries)', () => {
  const a = stick('a', { carbon: 30, price: 80, level: 'beginner', bow: 'midbow', lengths: [36.5] });
  const b = stick('b', { carbon: 60, price: 140, level: 'gevorderd', bow: 'lowbow', lengths: [36.5, 37.5] });
  const c = stick('c', { carbon: 90, price: 250, level: 'ervaren', bow: 'lowbow', lengths: [36.5, 37.5, 38.5] });
  const now = new Date();

  it('passes with three complete sticks that differ', () => {
    const e = evaluateSeries(definition(['a', 'b', 'c']), now, lookup([a, b, c]));
    expect(e.indexable).toBe(true);
    expect(e.problems).toEqual([]);
    expect(e.members.map((m) => m.label)).toEqual(['A', 'B', 'C']);
  });

  it('fails with fewer than three complete sticks, and lists the one with a gap with its reason', () => {
    const gap = stick('c', { carbonPercentage: undefined });
    const e = evaluateSeries(definition(['a', 'b', 'c']), now, lookup([a, b, gap]));
    expect(e.indexable).toBe(false);
    expect(e.members).toHaveLength(2);
    expect(e.notComparable[0]?.reasons.join(' ')).toContain('carbonpercentage');
  });

  it('fails when two sticks differ in nothing', () => {
    const twin = stick('twin', { carbon: 90, price: 250, level: 'ervaren', bow: 'lowbow', lengths: [36.5, 37.5, 38.5] });
    const e = evaluateSeries(definition(['a', 'c', 'twin']), now, lookup([a, c, twin]));
    expect(e.indexable).toBe(false);
    expect(e.problems.join(' ')).toContain('geen enkele eigenschap');
  });

  it('fails when the sticks differ in fewer than two properties', () => {
    const x = stick('x', { carbon: 40, price: 100, level: 'gevorderd', bow: 'lowbow', lengths: [36.5] });
    const y = stick('y', { carbon: 40, price: 140, level: 'gevorderd', bow: 'lowbow', lengths: [36.5] });
    const z = stick('z', { carbon: 40, price: 190, level: 'gevorderd', bow: 'lowbow', lengths: [36.5] });
    const e = evaluateSeries(definition(['x', 'y', 'z']), now, lookup([x, y, z]));
    expect(e.indexable).toBe(false);
    expect(e.problems.join(' ')).toContain('minder dan 2');
  });

  it('keeps a stick that is not active or not in the catalog out of the table, with a reason', () => {
    const e = evaluateSeries(definition(['a', 'b', 'c', 'gone']), now, lookup([a, b, c]));
    expect(e.indexable).toBe(true);
    expect(e.notComparable.map((n) => n.slug)).toEqual(['gone']);
  });

  it('never lets junior and senior sticks share a page', () => {
    const junior = stick('junior', { carbon: 10, price: 30, level: 'beginner', bow: 'ultrabow', lengths: [28, 30] });
    const e = evaluateSeries(definition(['junior', 'b', 'c']), now, lookup([junior, b, c]));
    expect(e.indexable).toBe(false);
    expect(e.problems.join(' ')).toContain('junior');
  });

  it('keeps feed imports out: their data is not checked by hand', () => {
    const imported = stick('imp', { feedImport: { feed: 'passahockey', importedAt: '2026-11-01' } });
    const e = evaluateSeries(definition(['imp', 'b', 'c']), now, lookup([imported, b, c]));
    expect(e.members.map((m) => m.label)).not.toContain('IMP');
  });

  it('does not look at shop prices: the status of a page cannot change weekly', () => {
    const source = JSON.stringify(evaluateSeries.toString());
    expect(source).not.toMatch(/getOffers|isPriceFresh|offers/);
  });
});

describe('the series in the catalog today', () => {
  const evaluations = SERIES.map((s) => evaluateSeries(s));

  it('has two series, both indexable', () => {
    expect(evaluations.map((e) => [e.series.slug, e.indexable])).toEqual([
      ['grays-jb-serie', true],
      ['grays-zaalsticks', true],
    ]);
    expect(indexableSeries().map((e) => e.series.slug)).toEqual(['grays-jb-serie', 'grays-zaalsticks']);
  });

  it('puts JB 6, 8, 10 and 12+ in the JB series, lowest carbon first', () => {
    expect(evaluations[0]?.members.map((m) => m.label)).toEqual(['JB 6', 'JB 8', 'JB 10', 'JB 12+']);
    expect(evaluations[0]?.notComparable).toEqual([]);
  });

  it('puts the four complete indoor sticks in the table and lists the four with a gap, each with its reason', () => {
    const indoor = evaluations[1]!;
    expect(indoor.members.map((m) => m.label).sort()).toEqual(['200i', '4i', '6i', 'JB3Xi']);
    const reasons = Object.fromEntries(indoor.notComparable.map((n) => [n.label, n.reasons.join(' ')]));
    expect(Object.keys(reasons).sort()).toEqual(['DB2Xi', 'JB8Xi', 'PB10Xi', 'PB9i']);
    expect(reasons['DB2Xi']).toContain('kromming');
    for (const label of ['JB8Xi', 'PB9i', 'PB10Xi']) expect(reasons[label]).toContain('carbonpercentage');
  });

  it('says where two sticks differ only in indicative price', () => {
    const pairs = (e: (typeof evaluations)[number]) => e.priceOnlyPairs.map(([x, y]) => `${x.label}+${y.label}`);
    expect(pairs(evaluations[0]!)).toEqual(['JB 10+JB 12+']);
    expect(pairs(evaluations[1]!)).toEqual(['4i+6i']);
  });

  it('links a stick to its series, members and sticks not yet comparable alike', () => {
    for (const [slug, series] of [
      ['grays-jb10-composite', 'grays-jb-serie'],
      ['grays-db2xi-dynabow-indoor', 'grays-zaalsticks'],
    ] as const) {
      expect(seriesForProduct(getProductBySlug(slug)!).map((e) => e.series.slug)).toEqual([series]);
    }
    expect(seriesForProduct(getProductBySlug('jdh-x93-pro-bow')!)).toEqual([]);
  });

  it('only names sticks that exist in the catalog', () => {
    for (const s of SERIES) for (const m of s.members) expect(getProductBySlug(m.slug), m.slug).toBeDefined();
  });
});
