import { describe, expect, it } from 'vitest';
import { productPageMetadata } from '@/components/catalog/ProductDetail';
import { getAllProducts } from './index';

// Technical SEO (2026-11-08): no title of an indexed stick page above 60 characters.
describe('stick page titles', () => {
  it('stay within 60 characters, and are unique', () => {
    const titles = getAllProducts(new Date()).map((p) => {
      const title = productPageMetadata(p).title;
      return typeof title === 'string' ? title : (title as { absolute: string }).absolute;
    });
    expect(titles.filter((t) => t.length > 60)).toEqual([]);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
