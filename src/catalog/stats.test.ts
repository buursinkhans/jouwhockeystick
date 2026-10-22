import { describe, expect, it } from 'vitest';
import { BRAND_PROFILES } from '@/content/brands';
import { getAllProducts, getFieldProducts, getIndoorProducts } from './index';
import { getCatalogStats } from './stats';

describe('getCatalogStats', () => {
  const now = new Date();
  const stats = getCatalogStats(now);

  it('counts exactly the sticks that /sticks and /zaalsticks list', () => {
    expect(stats.fieldSticks).toBe(
      getFieldProducts(now, { includeImported: true }).length,
    );
    expect(stats.indoorSticks).toBe(
      getIndoorProducts(now, { includeImported: true }).length,
    );
    expect(stats.fieldSticks + stats.indoorSticks).toBe(
      getAllProducts(now, { includeImported: true }).length,
    );
  });

  it('has a /merken profile for every brand in the catalog', () => {
    // Without a profile a brand would count on the homepage but be missing on /merken.
    const profiles = new Set<string>(BRAND_PROFILES.map((b) => b.brand));
    expect(stats.brands.filter((brand) => !profiles.has(brand))).toEqual([]);
  });
});
