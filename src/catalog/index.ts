import { getDiscipline } from './discipline';
import type { Brand, Discipline, Product } from './types';

export { getDiscipline };
import { graysJb6Composite } from './products/grays-jb6-composite';
import { graysJb10Composite } from './products/grays-jb10-composite';
import { braboEliteFiveWtbLb } from './products/brabo-elite-five-wtb-lb';
import { braboEliteXOneLb } from './products/brabo-elite-x-one-lb';
import { jdhX01MidBow } from './products/jdh-x01-mid-bow';
import { jdhX93ProBow } from './products/jdh-x93-pro-bow';
import { princessCompetition1StarProbow } from './products/princess-competition-1-star-probow';
import { princessPremium4k10StarSg9Lb } from './products/princess-premium-4k-10-star-sg9-lb';
import { graysAuraGtJunior } from './products/grays-aura-gt-junior';
import { jdhJuniorMidBow } from './products/jdh-junior-mid-bow';
import { braboGforceEliteXOneLbJr } from './products/brabo-gforce-elite-x-one-lb-jr';
import { princessCompetitionJr3k10Star } from './products/princess-competition-jr-3k-10-star';
import { princessPremiumJr4k10Star } from './products/princess-premium-jr-4k-10-star';
import { graysJb12PlusComposite } from './products/grays-jb12-plus-composite';
import { graysPb11PlusComposite } from './products/grays-pb11-plus-composite';
import { graysDb10PlusComposite } from './products/grays-db10-plus-composite';
import { adidasEstro4 } from './products/adidas-estro-4';
import { adidasEstro75Le } from './products/adidas-estro-75-le';
import { graysPb10xiCompositeIndoor } from './products/grays-pb10xi-composite-indoor';
import { graysJb8xiCompositeIndoor } from './products/grays-jb8xi-composite-indoor';
import { graysDb7xiCompositeIndoor } from './products/grays-db7xi-composite-indoor';
import { graysPb9iIndoor } from './products/grays-pb9i-indoor';
import { princessCompetitionJr10StarIndoor } from './products/princess-competition-jr-10-star-indoor';
import { grays6iDynabowIndoor } from './products/grays-6i-dynabow-indoor';
import { grays4iDynabowIndoor } from './products/grays-4i-dynabow-indoor';
import { scoopIndoorMidBow20Carbon } from './products/scoop-indoor-mid-bow-20-carbon';
import { scoopWdnJuniorIndoor } from './products/scoop-wdn-junior-indoor';
import { indianMaharadjaArcticWoodIndoor } from './products/indian-maharadja-arctic-wood-indoor';
import { tk3ControlBowJuniorIndoor } from './products/tk-3-control-bow-junior-indoor';
import { adidasYoungstar102627 } from './products/adidas-youngstar-10-2627';
import { graysImpulseGtJunior } from './products/grays-impulse-gt-junior';
import { braboOgeezSnowleopardJunior } from './products/brabo-ogeez-snowleopard-junior';
import { osakaProTourGf20Junior } from './products/osaka-pro-tour-gf-20-junior';
import { tkMaxiJunior } from './products/tk-maxi-junior';
import { princessCompetitionJunior3StarJbow } from './products/princess-competition-junior-3-star-jbow';
import { indianMaharadjaRedJunior } from './products/indian-maharadja-red-junior';
import { stagMagicJrBowJunior } from './products/stag-magic-jr-bow-junior';
import { adidasFabela302627 } from './products/adidas-fabela-30-2627';
import { adidasEstro602627 } from './products/adidas-estro-60-2627';
import { osakaProTour4020 } from './products/osaka-pro-tour-40-20';
import { ritualSpecialist55 } from './products/ritual-specialist-55';

const ALL_PRODUCTS: Product[] = [
  graysJb6Composite,
  graysJb10Composite,
  braboEliteFiveWtbLb,
  braboEliteXOneLb,
  jdhX01MidBow,
  jdhX93ProBow,
  princessCompetition1StarProbow,
  princessPremium4k10StarSg9Lb,
  graysAuraGtJunior,
  jdhJuniorMidBow,
  braboGforceEliteXOneLbJr,
  princessCompetitionJr3k10Star,
  princessPremiumJr4k10Star,
  graysJb12PlusComposite,
  graysPb11PlusComposite,
  graysDb10PlusComposite,
  adidasEstro4,
  adidasEstro75Le,
  graysPb10xiCompositeIndoor,
  graysJb8xiCompositeIndoor,
  graysDb7xiCompositeIndoor,
  graysPb9iIndoor,
  princessCompetitionJr10StarIndoor,
  grays6iDynabowIndoor,
  grays4iDynabowIndoor,
  scoopIndoorMidBow20Carbon,
  scoopWdnJuniorIndoor,
  indianMaharadjaArcticWoodIndoor,
  tk3ControlBowJuniorIndoor,
  adidasYoungstar102627,
  graysImpulseGtJunior,
  braboOgeezSnowleopardJunior,
  osakaProTourGf20Junior,
  tkMaxiJunior,
  princessCompetitionJunior3StarJbow,
  indianMaharadjaRedJunior,
  stagMagicJrBowJunior,
  adidasFabela302627,
  adidasEstro602627,
  osakaProTour4020,
  ritualSpecialist55,
];

/**
 * Bump whenever product data changes. Stamped on every advice result so an
 * old result can be traced back to the catalog it was calculated from.
 */
export const CATALOG_VERSION = '2026-10-05c';

const VERIFICATION_FRESHNESS_MONTHS = 12;

/**
 * A product with no valid source or an expired lastVerifiedAt (older than
 * 12 months) must not be shown as active (source-policy.md §3).
 */
export function isProductActive(
  product: Product,
  now: Date = new Date(),
): boolean {
  const lastVerifiedAt = new Date(product.experienceLevel.lastVerifiedAt);
  if (Number.isNaN(lastVerifiedAt.getTime())) {
    return false;
  }
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - VERIFICATION_FRESHNESS_MONTHS);
  return lastVerifiedAt >= cutoff;
}

/**
 * Every product in the catalog, including inactive ones. Only for internal
 * checks such as the catalog health report — never for pages.
 */
export function getCatalogProducts(): readonly Product[] {
  return ALL_PRODUCTS;
}

export function getAllProducts(now: Date = new Date()): Product[] {
  return ALL_PRODUCTS.filter((product) => isProductActive(product, now));
}

export function getFieldProducts(now: Date = new Date()): Product[] {
  return getAllProducts(now).filter(
    (product) => getDiscipline(product) === 'veld',
  );
}

export function getIndoorProducts(now: Date = new Date()): Product[] {
  return getAllProducts(now).filter(
    (product) => getDiscipline(product) === 'zaal',
  );
}

export function getProductBySlug(
  slug: string,
  now: Date = new Date(),
): Product | undefined {
  return getAllProducts(now).find((product) => product.slug === slug);
}

/** Brands that have at least one active product, optionally within one discipline. */
export function getAllBrands(
  now: Date = new Date(),
  discipline?: Discipline,
): Brand[] {
  const products = getAllProducts(now).filter(
    (product) => !discipline || getDiscipline(product) === discipline,
  );
  const brands = new Set(products.map((product) => product.brand));
  return Array.from(brands).sort();
}
