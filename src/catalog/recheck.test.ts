import { describe, expect, it } from 'vitest';
import { getCatalogProducts } from './index';
import { graysJb6Composite } from './products/grays-jb6-composite';
import {
  formatRecheckList,
  selectRecheckBatch,
  toRecheckCandidate,
} from './recheck';
import type { Product } from './types';

const verifiedOn = (product: Product, date: string, slug?: string): Product => {
  const copy = structuredClone(product);
  if (slug) copy.slug = slug;
  for (const value of Object.values(copy)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'lastVerifiedAt' in value
    ) {
      (value as { lastVerifiedAt: string }).lastVerifiedAt = date;
    }
  }
  return copy;
};

describe('toRecheckCandidate', () => {
  it('uses the oldest field date and a three-month due date', () => {
    const candidate = toRecheckCandidate(
      verifiedOn(graysJb6Composite, '2026-09-26'),
    );
    expect(candidate?.oldestVerifiedAt).toBe('2026-09-26');
    expect(candidate?.dueOn).toBe('2026-12-26');
  });

  it('lists each source URL once and reports missing specs', () => {
    const candidate = toRecheckCandidate(graysJb6Composite);
    const urls = candidate?.sourceUrls ?? [];
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBeGreaterThan(0);
    // A stick without a stated carbon percentage reports it as a gap.
    const withoutCarbon = toRecheckCandidate({
      ...graysJb6Composite,
      carbonPercentage: undefined,
    });
    expect(withoutCarbon?.gaps).toContain('carbonPercentage');
  });
});

describe('selectRecheckBatch', () => {
  const products = [
    verifiedOn(graysJb6Composite, '2026-10-10', 'b-later'),
    verifiedOn(graysJb6Composite, '2026-09-26', 'a-oldest'),
    verifiedOn(graysJb6Composite, '2027-01-01', 'c-fresh'),
  ];

  it('picks nothing well before the first due date', () => {
    expect(selectRecheckBatch(products, new Date('2026-11-01'))).toEqual([]);
  });

  it('picks sticks due within the horizon, oldest first', () => {
    const batch = selectRecheckBatch(products, new Date('2026-12-03'));
    expect(batch.map((c) => c.slug)).toEqual(['a-oldest']);
    const later = selectRecheckBatch(products, new Date('2026-12-20'));
    expect(later.map((c) => c.slug)).toEqual(['a-oldest', 'b-later']);
  });

  it('respects the batch size', () => {
    const batch = selectRecheckBatch(products, new Date('2027-06-01'), 1);
    expect(batch).toHaveLength(1);
  });

  it('works on the real catalog without errors', () => {
    const batch = selectRecheckBatch(
      getCatalogProducts(),
      new Date('2026-12-03'),
    );
    expect(batch.length).toBeLessThanOrEqual(12);
    expect(formatRecheckList(batch)).toContain('# Hercontrole');
  });
});
