import { describe, expect, it } from 'vitest';
import {
  applyHardFilters,
  filterByAbsoluteBudget,
  filterByAvailability,
  filterByLength,
  filterByVerification,
} from './hardFilters';
import { buildProduct, buildProfile, NOW } from './testFixtures';

describe('filterByLength', () => {
  it('keeps products with at least one length inside the profile range', () => {
    const product = buildProduct({ lengthsInches: { value: [36.5], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    const result = filterByLength([product], buildProfile({ lengthRangeInches: [35, 37.5] }));
    expect(result).toEqual([product]);
  });

  it('excludes products with no length inside the profile range', () => {
    const product = buildProduct({ lengthsInches: { value: [28, 30], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    const result = filterByLength([product], buildProfile({ lengthRangeInches: [35, 37.5] }));
    expect(result).toEqual([]);
  });
});

describe('filterByAvailability', () => {
  it('excludes unavailable products', () => {
    const product = buildProduct({ stock: { value: 'unavailable', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    expect(filterByAvailability([product])).toEqual([]);
  });

  it('keeps limited-stock products', () => {
    const product = buildProduct({ stock: { value: 'limited', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    expect(filterByAvailability([product])).toEqual([product]);
  });
});

describe('filterByAbsoluteBudget', () => {
  it('excludes products over the absolute budget', () => {
    const product = buildProduct({ priceIndicativeEur: { value: 200, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    expect(filterByAbsoluteBudget([product], buildProfile({ budgetMaxEur: 150 }))).toEqual([]);
  });

  it('keeps products within budget', () => {
    const product = buildProduct({ priceIndicativeEur: { value: 100, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    expect(filterByAbsoluteBudget([product], buildProfile({ budgetMaxEur: 150 }))).toEqual([product]);
  });
});

describe('filterByVerification', () => {
  it('excludes products with an expired lastVerifiedAt', () => {
    const product = buildProduct({ experienceLevel: { value: 'beginner', source: 'editorial-estimate', lastVerifiedAt: '2020-01-01' } });
    expect(filterByVerification([product], NOW)).toEqual([]);
  });
});

describe('applyHardFilters', () => {
  it('reports excludedCount for products that fail any filter', () => {
    const passing = buildProduct({ slug: 'passes' });
    const overBudget = buildProduct({ slug: 'too-expensive', priceIndicativeEur: { value: 999, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    const { passed, excludedCount, noMatchReason } = applyHardFilters(
      [passing, overBudget],
      buildProfile({ budgetMaxEur: 150 }),
      NOW,
    );
    expect(passed).toEqual([passing]);
    expect(excludedCount).toBe(1);
    expect(noMatchReason).toBeNull();
  });

  it('reports "length" when the length filter alone empties the candidate set', () => {
    const product = buildProduct({ lengthsInches: { value: [36.5], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    const result = applyHardFilters([product], buildProfile({ lengthRangeInches: [28, 30], budgetMaxEur: 1 }), NOW);
    expect(result.passed).toEqual([]);
    expect(result.noMatchReason).toBe('length');
  });

  it('reports "budget" only when length is fine but price is the actual blocker', () => {
    const product = buildProduct({
      lengthsInches: { value: [36.5], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      priceIndicativeEur: { value: 500, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const result = applyHardFilters(
      [product],
      buildProfile({ lengthRangeInches: [35, 37.5], budgetMaxEur: 50 }),
      NOW,
    );
    expect(result.passed).toEqual([]);
    expect(result.noMatchReason).toBe('budget');
  });

  it('reports "availability" when length and budget are fine but nothing is in stock', () => {
    const product = buildProduct({
      lengthsInches: { value: [36.5], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      stock: { value: 'unavailable', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const result = applyHardFilters(
      [product],
      buildProfile({ lengthRangeInches: [35, 37.5], budgetMaxEur: 500 }),
      NOW,
    );
    expect(result.passed).toEqual([]);
    expect(result.noMatchReason).toBe('availability');
  });
});
