import { productPath } from '@/catalog/paths';
import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/catalog';
import { getCuratedShoes, shoePath } from '@/catalog/shoes';
import { lastChecked } from '@/catalog/shoes/certainty';
import type { Product } from '@/catalog/types';
import { getAllArticles } from '@/content';
import { getAllBlogPosts } from '@/content/blog';
import { BLACK_FRIDAY } from '@/content/blackFriday';
import { HOCKEYSCHOENEN } from '@/content/hockeyschoenen';
import { METHODIEK } from '@/content/methodiek';
import { PRIVACY } from '@/content/privacy';
import { VELD } from '@/content/veld';
import { ZAAL } from '@/content/zaal';
import { absoluteUrl } from '@/lib/site';

const STATIC_PATHS = [
  '/',
  '/stickwijzer',
  '/sticks',
  '/zaalsticks',
  '/hockeyschoenen',
  '/hockeyschoenen/wijzer',
  '/kennis',
  '/merken',
  '/vergelijk',
  '/blog',
  '/over-ons',
  '/clubs',
  '/privacy',
  '/black-friday-hockey',
];

const latest = (dates: readonly string[]) =>
  dates.reduce((a, b) => (b > a ? b : a), '');

/**
 * The date a hub page itself shows as "bijgewerkt op", or its newest
 * article: Bing and AI search use lastmod to decide what to fetch again
 * (decision log 2026-10-28). Pages without such a date get none.
 */
function hubLastModified(): Record<string, string> {
  return {
    '/sticks': VELD.updatedAt,
    '/zaalsticks': ZAAL.updatedAt,
    '/hockeyschoenen': HOCKEYSCHOENEN.updatedAt,
    '/kennis': latest(getAllArticles().map((a) => a.updatedAt)),
    '/blog': latest(getAllBlogPosts().map((p) => p.updatedAt)),
    '/privacy': PRIVACY.updatedAt,
    [BLACK_FRIDAY.path]: BLACK_FRIDAY.updatedAt,
  };
}

/** Latest check date across a product's core sourced fields. */
function lastVerified(product: Product): string {
  return [
    product.experienceLevel.lastVerifiedAt,
    product.lengthsInches.lastVerifiedAt,
    product.priceIndicativeEur.lastVerifiedAt,
  ].reduce((latest, date) => (date > latest ? date : latest));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PATHS.map((path) => {
      const lastModified = hubLastModified()[path];
      return { url: absoluteUrl(path), ...(lastModified && { lastModified }) };
    }),
    { url: absoluteUrl('/methodiek'), lastModified: METHODIEK.updatedAt },
    ...getAllProducts().map((product) => ({
      url: absoluteUrl(productPath(product)),
      lastModified: lastVerified(product),
    })),
    // Only checked shoe models: feed models are noindex (decision log 2026-11-01).
    ...getCuratedShoes().map((shoe) => {
      const lastModified = lastChecked(shoe);
      return { url: absoluteUrl(shoePath(shoe)), ...(lastModified && { lastModified }) };
    }),
    ...getAllArticles().map((article) => ({
      url: absoluteUrl(`/kennis/${article.slug}`),
      lastModified: article.updatedAt,
    })),
    ...getAllBlogPosts().map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
    })),
  ];
}
