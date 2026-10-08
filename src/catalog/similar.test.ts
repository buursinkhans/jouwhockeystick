import { describe, expect, it } from 'vitest';
import { getAllProducts, getDiscipline } from './index';
import { describeDifference, getSimilarSticks, isJuniorStick } from './similar';
import type { Product } from './types';

const NOW = new Date('2026-10-08');
const products = getAllProducts(NOW);

function bySlug(slug: string): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`missing ${slug}`);
  return product;
}

describe('getSimilarSticks', () => {
  it('returns up to three other sticks for every product', () => {
    for (const product of products) {
      const similar = getSimilarSticks(product, products);
      expect(similar.length).toBeGreaterThan(0);
      expect(similar.length).toBeLessThanOrEqual(3);
      expect(similar.map((s) => s.product.slug)).not.toContain(product.slug);
    }
  });

  it('stays within the same discipline and size group', () => {
    for (const product of products) {
      for (const { product: other } of getSimilarSticks(product, products)) {
        expect(getDiscipline(other)).toBe(getDiscipline(product));
        expect(isJuniorStick(other)).toBe(isJuniorStick(product));
      }
    }
  });
});

describe('describeDifference', () => {
  it('states price, carbon, bow and level differences from catalog data', () => {
    const text = describeDifference(
      bySlug('brabo-elite-x-one-lb'),
      bySlug('brabo-elite-five-wtb-lb'),
    );
    expect(text).toBe(
      '€150 lagere richtprijs, minder carbon (50% tegen 100%) en ook een low bow.',
    );
  });

  it('leaves out a spec that one of the sticks does not state', () => {
    const text = describeDifference(
      bySlug('grays-jb6-composite'),
      bySlug('ritual-specialist-55'),
    );
    expect(text).not.toContain('carbon');
  });
});
