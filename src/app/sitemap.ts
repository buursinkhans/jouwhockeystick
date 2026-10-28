import { productPath } from '@/catalog/paths';
import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/catalog';
import type { Product } from '@/catalog/types';
import { getAllArticles } from '@/content';
import { getAllBlogPosts } from '@/content/blog';
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
  '/kennis',
  '/merken',
  '/vergelijk',
  '/blog',
  '/over-ons',
  '/clubs',
  '/privacy',
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
    '/kennis': latest(getAllArticles().map((a) => a.updatedAt)),
    '/blog': latest(getAllBlogPosts().map((p) => p.updatedAt)),
    '/privacy': PRIVACY.updatedAt,
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
