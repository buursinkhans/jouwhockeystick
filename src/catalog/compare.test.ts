import { describe, expect, it } from 'vitest';
import { buildCompareRows } from './compare';
import type { Product } from './types';

function buildProduct(overrides: Partial<Product> = {}): Product {
  const lastVerifiedAt = '2026-06-01';
  return {
    slug: 'test',
    brand: 'Grays',
    name: 'Test Stick',
    dataStatus: 'verified',
    imageAlt: 'Test',
    experienceLevel: {
      value: 'beginner',
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    recommendedPositions: {
      value: ['middenvelder'],
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    lengthsInches: {
      value: [35],
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    priceIndicativeEur: {
      value: 90,
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    stock: { value: 'available', source: 'editorial-estimate', lastVerifiedAt },
    summary: 'Test',
    strengths: {
      value: ['Sterk punt'],
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    pointsOfAttention: {
      value: ['Aandachtspunt'],
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    ...overrides,
  };
}

describe('buildCompareRows', () => {
  it('includes a spec row when only one of the two products has it, showing "Niet vermeld" for the other', () => {
    const a = buildProduct({
      slug: 'a',
      carbonPercentage: {
        value: 40,
        source: 'brand-website',
        lastVerifiedAt: '2026-06-01',
      },
    });
    const b = buildProduct({ slug: 'b', carbonPercentage: undefined });

    const rows = buildCompareRows(a, b);
    const carbonRow = rows.find((r) => r.label === 'Carbonpercentage');

    expect(carbonRow).toBeDefined();
    expect(carbonRow?.valueA).toBe('40%');
    expect(carbonRow?.valueB).toBe('Niet vermeld');
  });

  it('omits a spec row entirely when neither product has it', () => {
    const a = buildProduct({ slug: 'a', weightGrams: undefined });
    const b = buildProduct({ slug: 'b', weightGrams: undefined });

    const rows = buildCompareRows(a, b);

    expect(rows.some((r) => r.label === 'Gewicht')).toBe(false);
  });

  it('always includes price, brand, and length rows', () => {
    const a = buildProduct({
      slug: 'a',
      priceIndicativeEur: {
        value: 129.99,
        source: 'brand-website',
        lastVerifiedAt: '2026-06-01',
      },
    });
    const b = buildProduct({ slug: 'b' });

    const rows = buildCompareRows(a, b);

    expect(rows.find((r) => r.label === 'Adviesprijs')?.valueA).toBe('€129.99');
    expect(rows.some((r) => r.label === 'Merk')).toBe(true);
    expect(rows.some((r) => r.label === 'Beschikbare lengtes')).toBe(true);
  });
});
