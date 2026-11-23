import { getAllProducts } from '@/catalog';
import { BOW_LABELS } from '@/catalog/labels';
import { getOffers, isPriceFresh, sortOffers, totalPrice } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import { brandPageOf, brandPagePath } from '@/catalog/brandPages';
import { BRAND_PROFILES, brandAnchor } from '@/content/brands';
import { getAllArticles } from '@/content';
import { getAllBlogPosts } from '@/content/blog';
import type { Article } from '@/content/types';
import type { Product } from '@/catalog/types';
import type { SearchIndex, SearchItem } from './engine';

/**
 * The index of the live search, built at build time (src/app/data/zoekindex.json).
 * Only hand-checked sticks: the feed imports are thousands of models and stay
 * on /zoeken, which reads them on the server. Brands come from the brand
 * profiles, articles from the knowledge base and the blog.
 */

function stickItem(product: Product, now: Date): SearchItem {
  const offers = getOffers(product);
  const current = sortOffers(offers, { size: null, now }).filter((offer) => isPriceFresh(offer, now) && offer.inStock);
  const lowest = current[0];
  return {
    type: 'stick',
    id: product.slug,
    title: product.name,
    brand: product.brand,
    path: productPath(product),
    carbon: product.carbonPercentage?.value ?? null,
    ...(product.bowProfile && { bow: BOW_LABELS[product.bowProfile.value] }),
    ...(product.imageUrl && { image: product.imageUrl }),
    price: {
      ...(lowest && {
        shopEur: Math.round(totalPrice(lowest) * 100) / 100,
        shopCount: current.length,
        readAt: current.map((offer) => offer.readAt as string).sort()[0],
      }),
      indicativeEur: product.priceIndicativeEur.value,
    },
  };
}

function articleItem(article: Article, base: '/kennis' | '/blog', category: string): SearchItem {
  return {
    type: 'article',
    id: `${base}/${article.slug}`,
    title: article.title,
    path: `${base}/${article.slug}`,
    keywords: article.sections.map((section) => section.heading).join(' '),
    category,
    summary: article.metaDescription,
  };
}

export function buildSearchIndex(now: Date = new Date()): SearchIndex {
  const products = getAllProducts(now);
  const items: SearchItem[] = products.map((product) => stickItem(product, now));

  for (const profile of BRAND_PROFILES) {
    const count = products.filter((product) => product.brand === profile.brand).length;
    if (count === 0) continue;
    const page = brandPageOf(profile.brand, now);
    items.push({
      type: 'brand',
      id: profile.brand,
      title: profile.brand,
      path: page ? brandPagePath(page.definition.slug) : `/merken#${brandAnchor(profile.brand)}`,
      hasPage: Boolean(page),
      stickCount: count,
    });
  }

  for (const article of getAllArticles()) items.push(articleItem(article, '/kennis', 'Kennisbank'));
  for (const post of getAllBlogPosts()) items.push(articleItem(post, '/blog', 'Blog'));

  return { generatedAt: now.toISOString(), items };
}
