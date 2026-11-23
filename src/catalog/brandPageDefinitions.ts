/**
 * The brand pages under /merken/<slug> (decision log 2026-11-23). Only which
 * brands have a page: whether a page is indexed is decided from the catalog
 * data in `brandPages.ts`. No imports, so IndexNow can read this file
 * (src/seo/indexnow.ts).
 *
 * Batch 1, chosen by the owner on 2026-11-22: Grays, Brabo, Princess, JDH and
 * Osaka. Grays, Brabo and Princess came first; JDH and Osaka followed in a second PR.
 */
export type BrandPageDefinition = {
  /** The URL: /merken/<slug>. */
  slug: string;
  /** The brand as it is spelled in the catalog and in src/content/brands.ts. */
  brand: string;
};

export const BRAND_PAGES: readonly BrandPageDefinition[] = [
  { slug: 'grays', brand: 'Grays' },
  { slug: 'brabo', brand: 'Brabo' },
  { slug: 'princess', brand: 'Princess' },
  { slug: 'jdh', brand: 'JDH' },
  { slug: 'osaka', brand: 'Osaka' },
];

export const brandPagePath = (slug: string) => `/merken/${slug}`;
