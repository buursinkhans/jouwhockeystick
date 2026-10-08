import { describe, expect, it } from 'vitest';
import { getAllBrands } from '@/catalog';
import { BRAND_PROFILES } from './brands';

describe('brand profiles', () => {
  it('has a profile for every brand in the catalog', () => {
    const profiled = new Set(BRAND_PROFILES.map((profile) => profile.brand));
    for (const brand of getAllBrands()) {
      expect(profiled.has(brand), brand).toBe(true);
    }
  });

  it('lists each brand once', () => {
    const brands = BRAND_PROFILES.map((profile) => profile.brand);
    expect(new Set(brands).size).toBe(brands.length);
  });
});
