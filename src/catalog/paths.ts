import type { Product } from './types';

/**
 * Product pages live in two places (decision log 2026-10-23): sticks we keep
 * by hand under /sticks (indexed, in the sitemap), sticks imported from the
 * PassaHockey feed under /aanbod (noindex, and closed to crawlers in
 * robots.txt, so Google does not spend its crawl budget on them). Every link
 * to a product page goes through productPath.
 */
export const PRODUCT_SECTIONS = {
  curated: '/sticks',
  imported: '/aanbod',
} as const;

export type ProductSection =
  (typeof PRODUCT_SECTIONS)[keyof typeof PRODUCT_SECTIONS];

export function productSection(product: Product): ProductSection {
  // Same test as isFeedImport in ./index; repeated here so client components
  // can use productPath without pulling in the whole catalog.
  return product.feedImport !== undefined
    ? PRODUCT_SECTIONS.imported
    : PRODUCT_SECTIONS.curated;
}

export function productPath(product: Product): string {
  return `${productSection(product)}/${product.slug}`;
}
