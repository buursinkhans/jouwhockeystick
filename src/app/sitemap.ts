import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/catalog';
import type { Product } from '@/catalog/types';
import { getAllArticles } from '@/content';
import { getAllBlogPosts } from '@/content/blog';
import { METHODIEK } from '@/content/methodiek';
import { absoluteUrl } from '@/lib/site';

const STATIC_PATHS = [
  '/',
  '/stickwijzer',
  '/sticks',
  '/merken',
  '/vergelijk',
  '/blog',
  '/over-ons',
  '/privacy',
];

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
    ...STATIC_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    { url: absoluteUrl('/methodiek'), lastModified: METHODIEK.updatedAt },
    ...getAllProducts().map((product) => ({
      url: absoluteUrl(`/sticks/${product.slug}`),
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
