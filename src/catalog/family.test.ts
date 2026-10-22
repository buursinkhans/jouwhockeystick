import { describe, expect, it } from 'vitest';
import { getAllProducts, getProductBySlug } from './index';
import { getProductFamily } from './family';

const now = new Date('2026-10-22');
const products = getAllProducts(now);

describe('getProductFamily', () => {
  it('lists the Grays Jumbow field sticks from least to most carbon', () => {
    const jb10 = getProductBySlug('grays-jb10-composite');
    expect(jb10).toBeDefined();
    const family = getProductFamily(jb10!, products);
    expect(family?.family).toBe('Jumbow');
    const slugs = family?.members.map((p) => p.slug) ?? [];
    expect(slugs).toContain('grays-jb6-composite');
    expect(slugs).toContain('grays-jb10-composite');
    // Indoor sticks of the same family belong to the indoor range, not here.
    expect(slugs).not.toContain('grays-jb8xi-composite-indoor');
    const carbon = family!.members.map((p) => p.carbonPercentage?.value ?? -1);
    expect(carbon).toEqual([...carbon].sort((a, b) => a - b));
  });

  it('gives no family for a brand that does not name its families', () => {
    const other = products.find((p) => p.brand !== 'Grays');
    expect(getProductFamily(other!, products)).toBeNull();
  });
});
