import type { Brand, Product } from './types';
import { graysGx1000JumbowJunior } from './products/grays-gx1000-jumbow-junior';
import { graysGx1000Jumbow } from './products/grays-gx1000-jumbow';
import { graysGx2000Ultrabow } from './products/grays-gx2000-ultrabow';
import { graysGr5000Dynabow } from './products/grays-gr5000-dynabow';
import { graysGr7000Probow } from './products/grays-gr7000-probow';
import { braboOgeoFlow25 } from './products/brabo-ogeo-flow-25';
import { braboElite2Force } from './products/brabo-elite-2-force';
import { adidasLx24Compo6 } from './products/adidas-lx24-compo6';
import { adidasLx24CarbonCompo1 } from './products/adidas-lx24-carbon-compo1';
import { jdhX93Concave } from './products/jdh-x93-concave';
import { jdhX79LowBow } from './products/jdh-x79-low-bow';
import { princessPremium7Star } from './products/princess-premium-7-star';
import { princessY3Junior } from './products/princess-y3-junior';

const ALL_PRODUCTS: Product[] = [
  graysGx1000JumbowJunior,
  graysGx1000Jumbow,
  graysGx2000Ultrabow,
  graysGr5000Dynabow,
  graysGr7000Probow,
  braboOgeoFlow25,
  braboElite2Force,
  adidasLx24Compo6,
  adidasLx24CarbonCompo1,
  jdhX93Concave,
  jdhX79LowBow,
  princessPremium7Star,
  princessY3Junior,
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
