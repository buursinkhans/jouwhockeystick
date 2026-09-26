import type { Brand, Product } from './types';
import { graysJb6Composite } from './products/grays-jb6-composite';
import { graysJb10Composite } from './products/grays-jb10-composite';
import { braboEliteFiveWtbLb } from './products/brabo-elite-five-wtb-lb';
import { braboEliteXOneLb } from './products/brabo-elite-x-one-lb';
import { jdhX01MidBow } from './products/jdh-x01-mid-bow';
import { jdhX93ProBow } from './products/jdh-x93-pro-bow';
import { princessCompetition1StarProbow } from './products/princess-competition-1-star-probow';
import { princessPremium4k10StarSg9Lb } from './products/princess-premium-4k-10-star-sg9-lb';

const ALL_PRODUCTS: Product[] = [
  graysJb6Composite,
  graysJb10Composite,
  braboEliteFiveWtbLb,
  braboEliteXOneLb,
  jdhX01MidBow,
  jdhX93ProBow,
  princessCompetition1StarProbow,
  princessPremium4k10StarSg9Lb,
];

const VERIFICATION_FRESHNESS_MONTHS = 12;

/**
 * A product with no valid source or an expired lastVerifiedAt (older than
 * 12 months) must not be shown as active (source-policy.md §3).
 */
export function isProductActive(product: Product, now: Date = new Date()): boolean {
  const lastVerifiedAt = new Date(product.experienceLevel.lastVerifiedAt);
  if (Number.isNaN(lastVerifiedAt.getTime())) {
    return false;
  }
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - VERIFICATION_FRESHNESS_MONTHS);
  return lastVerifiedAt >= cutoff;
}

export function getAllProducts(now: Date = new Date()): Product[] {
  return ALL_PRODUCTS.filter((product) => isProductActive(product, now));
}

export function getProductBySlug(slug: string, now: Date = new Date()): Product | undefined {
  return getAllProducts(now).find((product) => product.slug === slug);
}

export function getAllBrands(now: Date = new Date()): Brand[] {
  const brands = new Set(getAllProducts(now).map((product) => product.brand));
  return Array.from(brands).sort();
}
