import { describe, expect, it } from 'vitest';
import {
  checkCatalogHealth,
  checkProductHealth,
  formatHealthReport,
} from './health';
import { getCatalogProducts } from './index';
import { graysJb6Composite } from './products/grays-jb6-composite';
import type { Product } from './types';

const verifiedOn = (product: Product, date: string): Product => {
  const copy = structuredClone(product);
  for (const value of Object.values(copy)) {
    if (typeof value === 'object' && value !== null && 'lastVerifiedAt' in value) {
      (value as { lastVerifiedAt: string }).lastVerifiedAt = date;
    }
  }
  return copy;
};

describe('checkProductHealth', () => {
  it('reports nothing for a fresh, verified product with an image', () => {
    const product = {
      ...verifiedOn(graysJb6Composite, '2026-09-26'),
      bolProductUrl: 'https://www.bol.com/nl/nl/p/example/9300000000000000/',
    };
    const health = checkProductHealth(product, new Date('2026-10-08'));
    expect(health.issues).toEqual([]);
  });

  it('flags a quarterly re-check after three months', () => {
    const product = verifiedOn(graysJb6Composite, '2026-06-01');
    const health = checkProductHealth(product, new Date('2026-10-08'));
    const kinds = health.issues.map((issue) => issue.kind);
    expect(kinds).toContain('recheck_due');
    expect(kinds).not.toContain('hidden');
  });

  it('flags a product hidden from the site after twelve months', () => {
    const product = verifiedOn(graysJb6Composite, '2025-09-01');
    const health = checkProductHealth(product, new Date('2026-10-08'));
    expect(health.issues).toContainEqual({
      kind: 'hidden',
      field: 'experienceLevel',
      lastVerifiedAt: '2025-09-01',
    });
  });

  it('flags invalid dates, test data and a missing image', () => {
    const product: Product = {
      ...verifiedOn(graysJb6Composite, 'not-a-date'),
      dataStatus: 'test-data',
      imageUrl: undefined,
      bolProductUrl: undefined,
    };
    const kinds = checkProductHealth(product, new Date('2026-10-08')).issues.map(
      (issue) => issue.kind,
    );
    expect(kinds).toContain('invalid_date');
    expect(kinds).toContain('test_data');
    expect(kinds).toContain('missing_image');
    expect(kinds).toContain('search_link_only');
  });
});

describe('not sold at bol.com', () => {
  it('reports the stick as not sold instead of as a search link', () => {
    const product: Product = {
      ...verifiedOn(graysJb6Composite, '2026-09-26'),
      bolProductUrl: undefined,
      bolNotSold: { checkedAt: '2026-10-08' },
    };
    const kinds = checkProductHealth(product, new Date('2026-10-08')).issues.map(
      (issue) => issue.kind,
    );
    expect(kinds).toEqual(['not_sold_at_bol']);
  });
});

describe('checkCatalogHealth', () => {
  it('covers every product, including inactive ones', () => {
    const products = getCatalogProducts();
    const report = checkCatalogHealth(products, new Date('2026-10-08'));
    expect(report.productCount).toBe(products.length);
  });

  it('gives the earliest re-check date', () => {
    const report = checkCatalogHealth(
      [
        verifiedOn(graysJb6Composite, '2026-09-26'),
        verifiedOn(graysJb6Composite, '2026-08-15'),
      ],
      new Date('2026-10-08'),
    );
    expect(report.nextRecheckDue).toBe('2026-11-15');
  });

  it('formats an all-clear report in Dutch', () => {
    const report = checkCatalogHealth(
      [
        {
          ...verifiedOn(graysJb6Composite, '2026-09-26'),
          bolProductUrl:
            'https://www.bol.com/nl/nl/p/example/9300000000000000/',
        },
      ],
      new Date('2026-10-08'),
    );
    expect(formatHealthReport(report)).toContain('Alles in orde');
  });
});
