import { describe, expect, it } from 'vitest';
import {
  getAllBrands,
  getAllProducts,
  getCatalogProducts,
  isProductActive,
  getDiscipline,
  getFieldProducts,
  getIndoorProducts,
} from './index';
import { productSchema, type Product } from './types';
import { getAdvice } from '@/advice-engine/engine';
import { buildPerformanceAnswers } from '@/advice-engine/testFixtures';

function buildProduct(lastVerifiedAt: string): Product {
  const sourced = {
    value: 'beginner' as const,
    source: 'editorial-estimate' as const,
    lastVerifiedAt,
  };
  return {
    slug: 'test',
    brand: 'Grays',
    name: 'Test',
    dataStatus: 'test-data',
    imageAlt: 'Test',
    experienceLevel: sourced,
    recommendedPositions: {
      value: ['middenvelder'],
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    bowProfile: {
      value: 'lowbow',
      source: 'editorial-estimate',
      lastVerifiedAt,
    },
    carbonPercentage: {
      value: 10,
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

  it('lists only brands that have field sticks in the field brand filter', () => {
    const fieldBrands = getAllBrands(new Date(), 'veld');
    for (const brand of fieldBrands) {
      expect(
        getFieldProducts().some((product) => product.brand === brand),
      ).toBe(true);
    }
    expect(fieldBrands).toEqual(
      expect.arrayContaining(['Brabo', 'Grays', 'JDH', 'Princess', 'adidas']),
    );
  });
});

describe('field and indoor sticks', () => {
  it('splits the catalog into field and indoor sticks without overlap', () => {
    const field = getFieldProducts().map((product) => product.slug);
    const indoor = getIndoorProducts().map((product) => product.slug);

    expect(indoor.length).toBeGreaterThan(0);
    expect(field.filter((slug) => indoor.includes(slug))).toEqual([]);
    expect(field.length + indoor.length).toBe(getAllProducts().length);
  });

  it('treats a product without a stated discipline as a field stick', () => {
    expect(getDiscipline(buildProduct('2026-06-01'))).toBe('veld');
  });

  it('gives every indoor stick a traceable source: the brand site or a bol.com listing', () => {
    for (const product of getIndoorProducts()) {
      expect(['brand-website', 'partner-shop']).toContain(
        product.discipline?.source,
      );
      expect(product.discipline?.sourceUrl).toBeDefined();
      expect(product.priceIndicativeEur.sourceUrl).toBeDefined();
    }
  });

  it('never lets the stickwijzer advise an indoor stick', () => {
    const indoor = new Set(getIndoorProducts().map((product) => product.slug));
    const advice = getAdvice(
      buildPerformanceAnswers({ budget_band: 'compare_first' }),
      getAllProducts(),
    );

    expect(advice.results.length).toBeGreaterThan(0);
    for (const item of [...advice.results, ...advice.otherSizeOptions]) {
      expect(indoor.has(item.product.slug)).toBe(false);
    }
  });
});

describe('bolProductUrl', () => {
  it('is a valid bol.com product page wherever it is set', () => {
    for (const product of getCatalogProducts()) {
      if (product.bolProductUrl === undefined) continue;
      const parsed = productSchema.shape.bolProductUrl.safeParse(
        product.bolProductUrl,
      );
      expect(parsed.success).toBe(true);
    }
  });
});
