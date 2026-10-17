import { getDiscipline } from './discipline';
import type { Brand, Discipline, Product } from './types';
import { PASSAHOCKEY_PRODUCTS } from './imported/passahockey';

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
import { reeceAlphaJr } from './products/reece-alpha-jr';
import { raviJuniorMidBow } from './products/ravi-junior-mid-bow';
import { raviJunior30Carbon } from './products/ravi-junior-30-carbon';
import { raviJuniorLowBow50Carbon } from './products/ravi-junior-low-bow-50-carbon';
import { osakaStick1SeriesJunior } from './products/osaka-stick-1-series-junior';
import { princessCompetitionJunior1StarJbow } from './products/princess-competition-junior-1-star-jbow';
import { indianMaharadjaPro10Junior } from './products/indian-maharadja-pro-10-junior';
import { scoopWdnJuniorVeld } from './products/scoop-wdn-junior-veld';
import { graysAftershockUltrabow } from './products/grays-aftershock-ultrabow';
import { csign20CarbonMidBow } from './products/csign-20-carbon-mid-bow';
import { csign40CarbonLowBow } from './products/csign-40-carbon-low-bow';
import { stagMatrix75Carbon } from './products/stag-matrix-75-carbon';
import { indianMaharadjaBlade10 } from './products/indian-maharadja-blade-10';
import { reeceNoxx600 } from './products/reece-noxx-600';
import { raviMidBow70Carbon } from './products/ravi-mid-bow-70-carbon';
import { raviProBow50Carbon } from './products/ravi-pro-bow-50-carbon';
import { y1LbX2 } from './products/y1-lb-x2';
import { y1Glg30 } from './products/y1-glg-30';
import { y1Glg50 } from './products/y1-glg-50';
import { scoopWdnZaalJunior } from './products/scoop-wdn-zaal-junior';
import { reeceInAlphaJr } from './products/reece-in-alpha-jr';
import { grays200iUltrabowIndoor } from './products/grays-200i-ultrabow-indoor';
import { graysDb2xiDynabowIndoor } from './products/grays-db2xi-dynabow-indoor';
import { graysJb3xiJumbowIndoor } from './products/grays-jb3xi-jumbow-indoor';
import { adidasEstro10JuniorIndoor } from './products/adidas-estro-10-junior-indoor';
import { indianMaharadjaSwiftJuniorIndoor } from './products/indian-maharadja-swift-junior-indoor';
import { y1IndoorMidBowW1 } from './products/y1-indoor-mid-bow-w1';
import { y1IndoorLowBowC50 } from './products/y1-indoor-low-bow-c50';
import { malikLowbow2 } from './products/malik-lowbow-2';
import { malikLowbow4Junior } from './products/malik-lowbow-4-junior';
import { osakaMidbowHoutIndoorJunior } from './products/osaka-midbow-hout-indoor-junior';
import { osakaProbowGfIndoorJunior } from './products/osaka-probow-gf-indoor-junior';
import { graysDb5Composite } from './products/grays-db5-composite';
import { adidasYoungstar9 } from './products/adidas-youngstar-9';
import { scoopWdnSeniorVeld } from './products/scoop-wdn-senior-veld';
import { graysDb8Composite } from './products/grays-db8-composite';
import { graysDb6Composite } from './products/grays-db6-composite';
import { graysDb10Composite } from './products/grays-db10-composite';
import { graysJb8Composite } from './products/grays-jb8-composite';
import { graysPb8Composite } from './products/grays-pb8-composite';
import { graysMb8Composite } from './products/grays-mb8-composite';
import { graysMb7Composite } from './products/grays-mb7-composite';
import { graysAc800JumbowS } from './products/grays-ac800-jumbow-s';
import { graysAc700DynabowS } from './products/grays-ac700-dynabow-s';
import { graysAc600ProbowS } from './products/grays-ac600-probow-s';
import { graysAc500DynabowS } from './products/grays-ac500-dynabow-s';

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
  reeceAlphaJr,
  raviJuniorMidBow,
  raviJunior30Carbon,
  raviJuniorLowBow50Carbon,
  osakaStick1SeriesJunior,
  princessCompetitionJunior1StarJbow,
  indianMaharadjaPro10Junior,
  scoopWdnJuniorVeld,
  graysAftershockUltrabow,
  csign20CarbonMidBow,
  csign40CarbonLowBow,
  stagMatrix75Carbon,
  indianMaharadjaBlade10,
  reeceNoxx600,
  raviMidBow70Carbon,
  raviProBow50Carbon,
  y1LbX2,
  y1Glg30,
  y1Glg50,
  scoopWdnZaalJunior,
  reeceInAlphaJr,
  grays200iUltrabowIndoor,
  graysDb2xiDynabowIndoor,
  graysJb3xiJumbowIndoor,
  adidasEstro10JuniorIndoor,
  indianMaharadjaSwiftJuniorIndoor,
  y1IndoorMidBowW1,
  y1IndoorLowBowC50,
  malikLowbow2,
  malikLowbow4Junior,
  osakaMidbowHoutIndoorJunior,
  osakaProbowGfIndoorJunior,
  graysDb5Composite,
  adidasYoungstar9,
  scoopWdnSeniorVeld,
  graysDb8Composite,
  graysDb6Composite,
  graysDb10Composite,
  graysJb8Composite,
  graysPb8Composite,
  graysMb8Composite,
  graysMb7Composite,
  graysAc800JumbowS,
  graysAc700DynabowS,
  graysAc600ProbowS,
  graysAc500DynabowS,
];

/**
 * Bump whenever product data changes. Stamped on every advice result so an
 * old result can be traced back to the catalog it was calculated from.
 */
export const CATALOG_VERSION = '2026-10-17';

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
 * Every hand-curated product in the catalog, including inactive ones. Only for
 * internal checks such as the catalog health report — never for pages. Sticks
 * imported in bulk from the PassaHockey feed are separate: getImportedProducts.
 */
export function getCatalogProducts(): readonly Product[] {
  return ALL_PRODUCTS;
}

/** Sticks imported in bulk from the PassaHockey feed (src/catalog/imported/, generated). */
export function getImportedProducts(): readonly Product[] {
  return PASSAHOCKEY_PRODUCTS;
}

/** True for a stick from the bulk feed import: noindex page, not in the sitemap or articles. */
export function isFeedImport(product: Product): boolean {
  return product.feedImport !== undefined;
}

export type ProductQuery = {
  /**
   * Also return the sticks imported from the PassaHockey feed. Off by default,
   * so articles, the homepage and the sitemap stay on the curated catalog; the
   * stickwijzer, catalog pages, compare page and product pages turn it on.
   */
  includeImported?: boolean;
};

export function getAllProducts(
  now: Date = new Date(),
  { includeImported = false }: ProductQuery = {},
): Product[] {
  const products = includeImported
    ? [...ALL_PRODUCTS, ...PASSAHOCKEY_PRODUCTS]
    : ALL_PRODUCTS;
  return products.filter((product) => isProductActive(product, now));
}

export function getFieldProducts(
  now: Date = new Date(),
  query: ProductQuery = {},
): Product[] {
  return getAllProducts(now, query).filter(
    (product) => getDiscipline(product) === 'veld',
  );
}

export function getIndoorProducts(
  now: Date = new Date(),
  query: ProductQuery = {},
): Product[] {
  return getAllProducts(now, query).filter(
    (product) => getDiscipline(product) === 'zaal',
  );
}

/** Looks in the curated catalog and the feed import, so every product page resolves. */
export function getProductBySlug(
  slug: string,
  now: Date = new Date(),
): Product | undefined {
  return getAllProducts(now, { includeImported: true }).find(
    (product) => product.slug === slug,
  );
}

/** Brands that have at least one active product, optionally within one discipline. */
export function getAllBrands(
  now: Date = new Date(),
  discipline?: Discipline,
  query: ProductQuery = {},
): Brand[] {
  const products = getAllProducts(now, query).filter(
    (product) => !discipline || getDiscipline(product) === discipline,
  );
  const brands = new Set(products.map((product) => product.brand));
  return Array.from(brands).sort();
}
