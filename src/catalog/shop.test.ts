import { describe, expect, it } from 'vitest';
import { getAllProducts } from './index';
import { isPassaSportsOnly } from './shop';
import { productSchema } from './types';

const products = getAllProducts(new Date('2026-10-10'));

describe('PassaSports-only sticks', () => {
  it('are sticks bol.com does not sell, with a PassaSports page', () => {
    const passaOnly = products.filter(isPassaSportsOnly);
    expect(passaOnly.length).toBeGreaterThan(0);
    for (const product of passaOnly) {
      expect(product.bolProductUrl).toBeUndefined();
      expect(product.bolNotSold).toBeDefined();
    }
  });

  it('never applies to a stick that bol.com sells', () => {
    for (const product of products.filter((p) => p.bolProductUrl)) {
      expect(isPassaSportsOnly(product)).toBe(false);
    }
  });

  it('only stores PassaSports product URLs', () => {
    for (const product of products) {
      if (product.passaSportsProductUrl === undefined) continue;
      expect(
        productSchema.shape.passaSportsProductUrl.safeParse(
          product.passaSportsProductUrl,
        ).success,
      ).toBe(true);
    }
  });
});
