import { describe, expect, it } from 'vitest';
import { getAllBrands, getFieldProducts } from './index';
import { applyCatalogFilters, filterQuery, hasFilters, parseCatalogFilters, shownPrice } from './filters';

const now = new Date('2026-11-03T12:00:00Z');
const brands = getAllBrands(now, 'veld', { includeImported: true });
const products = getFieldProducts(now, { includeImported: true });

describe('parseCatalogFilters', () => {
  it('keeps known values and drops unknown or malformed ones', () => {
    expect(
      parseCatalogFilters({ brand: 'Grays', niveau: 'beginner', bow: 'midbow', lengte: '36.5', budget: '100' }, brands),
    ).toEqual({ brand: 'Grays', niveau: 'beginner', bow: 'midbow', lengte: 36.5, budget: 100 });
    expect(
      parseCatalogFilters({ brand: 'Onbekend', niveau: 'pro', bow: 'krom', lengte: '36.3', budget: '123' }, brands),
    ).toEqual({});
    expect(hasFilters(parseCatalogFilters({}, brands))).toBe(false);
  });

  it('takes the first value of a repeated parameter', () => {
    expect(parseCatalogFilters({ niveau: ['ervaren', 'beginner'] }, brands)).toEqual({ niveau: 'ervaren' });
  });
});

describe('applyCatalogFilters', () => {
  it('only returns sticks that meet every filter', () => {
    const filters = { niveau: 'beginner', lengte: 34, budget: 100 } as const;
    const result = applyCatalogFilters(products, filters, now);
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.experienceLevel.value).toBe('beginner');
      expect(p.lengthsInches.value).toContain(34);
      expect(shownPrice(p, now, 34)).toBeLessThanOrEqual(100);
    }
  });

  it('returns everything without filters', () => {
    expect(applyCatalogFilters(products, {}, now)).toHaveLength(products.length);
  });
});

describe('filterQuery', () => {
  it('builds a query that keeps the filters', () => {
    expect(filterQuery({ niveau: 'beginner', budget: 100 }, { pagina: '2' })).toBe('?niveau=beginner&budget=100&pagina=2');
    expect(filterQuery({})).toBe('');
  });
});
