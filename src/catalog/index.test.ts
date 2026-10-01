import { describe, expect, it } from 'vitest';
import { getAllBrands, getAllProducts, isProductActive } from './index';
import type { Product } from './types';

function buildProduct(lastVerifiedAt: string): Product {
  const sourced = { value: 'beginner' as const, source: 'editorial-estimate' as const, lastVerifiedAt };
  return {
    slug: 'test',
    brand: 'Grays',
    name: 'Test',
    dataStatus: 'test-data',
    imageAlt: 'Test',
    experienceLevel: sourced,
    recommendedPositions: { value: ['middenvelder'], source: 'editorial-estimate', lastVerifiedAt },
    bowProfile: { value: 'lowbow', source: 'editorial-estimate', lastVerifiedAt },
    carbonPercentage: { value: 10, source: 'editorial-estimate', lastVerifiedAt },
    lengthsInches: { value: [35], source: 'editorial-estimate', lastVerifiedAt },
    priceIndicativeEur: { value: 90, source: 'editorial-estimate', lastVerifiedAt },
    stock: { value: 'available', source: 'editorial-estimate', lastVerifiedAt },
    summary: 'Test',
    strengths: { value: ['Sterk punt'], source: 'editorial-estimate', lastVerifiedAt },
    pointsOfAttention: { value: ['Aandachtspunt'], source: 'editorial-estimate', lastVerifiedAt },
  };
}

describe('isProductActive', () => {
  const now = new Date('2026-09-22T00:00:00.000Z');

  it('is active when verified within the last 12 months', () => {
    expect(isProductActive(buildProduct('2026-01-01'), now)).toBe(true);
  });

  it('is inactive when lastVerifiedAt is older than 12 months', () => {
    expect(isProductActive(buildProduct('2025-01-01'), now)).toBe(false);
  });

  it('is inactive when lastVerifiedAt is not a valid date', () => {
    expect(isProductActive(buildProduct('not-a-date'), now)).toBe(false);
  });
});

describe('catalog composition', () => {
  it('has at least one active product for every brand it claims to carry', () => {
    const products = getAllProducts();
    for (const brand of getAllBrands()) {
      expect(products.some((p) => p.brand === brand)).toBe(true);
    }
  });

  it('includes all five currently verified brands', () => {
    expect(getAllBrands()).toEqual(['Brabo', 'Grays', 'JDH', 'Princess', 'adidas']);
  });
});
