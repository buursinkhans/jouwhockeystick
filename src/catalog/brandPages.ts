import { getAllProducts, isFeedImport } from '@/catalog';
import { getDiscipline } from './discipline';
import { getOffers, isPriceFresh } from './offers';
import { isJuniorStick } from './similar';
import { BRAND_PAGES, type BrandPageDefinition } from './brandPageDefinitions';
import type { BowProfile, ExperienceLevel, Product } from './types';

export { BRAND_PAGES, brandPagePath, type BrandPageDefinition } from './brandPageDefinitions';

/**
 * The gate against thin pages for the brand pages (decision log 2026-11-23,
 * the owner's strict reading of 2026-11-22). A brand page is indexed only when
 * the hand-checked catalog can fill it:
 * - at least MIN_STICKS active sticks that are not from the feed, each with
 *   bow, carbon, lengths, an indicative price and a photo;
 * - at least MIN_LEVELS levels or MIN_BOWS bow profiles among them;
 * - for every one of them a current shop price (at most 14 days old) or an
 *   indicative price that has a source of its own (brand or shop).
 * Feed sticks never count: their specs come from a shop description and stay
 * noindex until they are enriched by hand. A brand that no longer passes gets
 * noindex and no place in the sitemap. The sticks are listed in groups (field
 * or indoor, senior or junior); a group gets its own table from MIN_GROUP
 * sticks, smaller groups share one table, and nothing is added to fill a gap.
 */
export const MIN_STICKS = 5;
export const MIN_LEVELS = 3;
export const MIN_BOWS = 2;
export const MIN_GROUP = 3;

export type BrandGroupKey = 'veld-senior' | 'veld-junior' | 'zaal-senior' | 'zaal-junior';

export const GROUP_LABELS: Record<BrandGroupKey, string> = {
  'veld-senior': 'Veldsticks voor volwassenen',
  'veld-junior': 'Veldsticks voor kinderen en junioren',
  'zaal-senior': 'Zaalsticks voor volwassenen',
  'zaal-junior': 'Zaalsticks voor kinderen en junioren',
};

const GROUP_ORDER: BrandGroupKey[] = ['veld-senior', 'veld-junior', 'zaal-senior', 'zaal-junior'];
const LEVEL_ORDER: Record<ExperienceLevel, number> = { beginner: 0, gevorderd: 1, ervaren: 2 };

export type BrandGroup = { key: BrandGroupKey; label: string; sticks: Product[] };

export type BrandEvaluation = {
  definition: BrandPageDefinition;
  /** Every stick that counts, in the order of a range (level, carbon, price), not a ranking. */
  sticks: Product[];
  /** Groups with at least MIN_GROUP sticks. */
  groups: BrandGroup[];
  /** The sticks of smaller groups, listed together. */
  others: Product[];
  levels: ExperienceLevel[];
  bows: BowProfile[];
  carbon: { min: number; max: number } | null;
  counts: { field: number; indoor: number; junior: number };
  /** Active hand-checked sticks of the brand that miss something, with the reason. */
  notComplete: { product: Product; reasons: string[] }[];
  indexable: boolean;
  /** Why the page is not indexable; empty when it is. */
  problems: string[];
};

export function groupOf(product: Product): BrandGroupKey {
  const field = getDiscipline(product) === 'veld';
  const junior = isJuniorStick(product);
  return `${field ? 'veld' : 'zaal'}-${junior ? 'junior' : 'senior'}` as BrandGroupKey;
}

/** Why a stick cannot be on the page; empty when it can. */
export function missingForBrandPage(product: Product): string[] {
  const reasons: string[] = [];
  if (isFeedImport(product)) reasons.push('de gegevens zijn niet met de hand gecontroleerd');
  if (!product.bowProfile) reasons.push('de kromming (bow) staat niet in onze gegevens');
  if (!product.carbonPercentage) reasons.push('het carbonpercentage staat niet in onze gegevens');
  if (product.lengthsInches.value.length === 0) reasons.push('de lengtes staan niet in onze gegevens');
  if (!(product.priceIndicativeEur.value > 0)) reasons.push('de richtprijs staat niet in onze gegevens');
  if (!product.imageUrl) reasons.push('er is geen foto');
  return reasons;
}

function hasPriceBasis(product: Product, now: Date): boolean {
  if (getOffers(product).some((offer) => isPriceFresh(offer, now))) return true;
  return product.priceIndicativeEur.source !== 'editorial-estimate';
}

const sortRange = (a: Product, b: Product) =>
  LEVEL_ORDER[a.experienceLevel.value] - LEVEL_ORDER[b.experienceLevel.value] ||
  (a.carbonPercentage?.value ?? 0) - (b.carbonPercentage?.value ?? 0) ||
  a.priceIndicativeEur.value - b.priceIndicativeEur.value ||
  a.name.localeCompare(b.name, 'nl');

const cache = new Map<string, BrandEvaluation>();

/**
 * `findProducts` is for tests: by default the active, hand-checked sticks of
 * the brand from the catalog (a stick that is not active is not found).
 */
export function evaluateBrandPage(
  definition: BrandPageDefinition,
  now: Date = new Date(),
  findProducts?: (brand: string) => Product[],
): BrandEvaluation {
  const key = `${definition.slug}|${now.toISOString().slice(0, 10)}`;
  if (!findProducts) {
    const hit = cache.get(key);
    if (hit) return hit;
  }
  const own = (findProducts ?? ((brand: string) => getAllProducts(now).filter((p) => p.brand === brand)))(definition.brand);
  const notComplete: BrandEvaluation['notComplete'] = [];
  const sticks: Product[] = [];
  for (const product of own.filter((p) => !isFeedImport(p))) {
    const reasons = missingForBrandPage(product);
    if (reasons.length > 0) notComplete.push({ product, reasons });
    else sticks.push(product);
  }
  sticks.sort(sortRange);

  const groups: BrandGroup[] = [];
  const others: Product[] = [];
  for (const groupKey of GROUP_ORDER) {
    const inGroup = sticks.filter((p) => groupOf(p) === groupKey);
    if (inGroup.length >= MIN_GROUP) groups.push({ key: groupKey, label: GROUP_LABELS[groupKey], sticks: inGroup });
    else others.push(...inGroup);
  }

  const levels = (['beginner', 'gevorderd', 'ervaren'] as const).filter((l) => sticks.some((p) => p.experienceLevel.value === l));
  const bows = [...new Set(sticks.map((p) => p.bowProfile!.value))];
  const carbons = sticks.map((p) => p.carbonPercentage!.value);

  const problems: string[] = [];
  if (sticks.length < MIN_STICKS) problems.push(`minder dan ${MIN_STICKS} sticks met volledige gegevens en foto (${sticks.length})`);
  if (levels.length < MIN_LEVELS && bows.length < MIN_BOWS) {
    problems.push(`minder dan ${MIN_LEVELS} niveaus en minder dan ${MIN_BOWS} bow-profielen`);
  }
  const withoutPrice = sticks.filter((p) => !hasPriceBasis(p, now));
  if (withoutPrice.length > 0) problems.push(`${withoutPrice.length} sticks zonder actuele prijs of bronvermelde richtprijs`);

  const evaluation: BrandEvaluation = {
    definition,
    sticks,
    groups,
    others,
    levels,
    bows,
    carbon: carbons.length ? { min: Math.min(...carbons), max: Math.max(...carbons) } : null,
    counts: {
      field: sticks.filter((p) => getDiscipline(p) === 'veld').length,
      indoor: sticks.filter((p) => getDiscipline(p) === 'zaal').length,
      junior: sticks.filter(isJuniorStick).length,
    },
    notComplete,
    indexable: problems.length === 0,
    problems,
  };
  if (!findProducts) cache.set(key, evaluation);
  return evaluation;
}

export const getBrandPage = (slug: string): BrandPageDefinition | undefined => BRAND_PAGES.find((b) => b.slug === slug);

/** The brand pages that are indexed: in the sitemap and linked from /merken, the stick pages and the series. */
export function indexableBrandPages(now: Date = new Date()): BrandEvaluation[] {
  return BRAND_PAGES.map((b) => evaluateBrandPage(b, now)).filter((e) => e.indexable);
}

/** The indexed brand page of a brand, or undefined (no page, or it does not pass the gate). */
export function brandPageOf(brand: string, now: Date = new Date()): BrandEvaluation | undefined {
  return indexableBrandPages(now).find((e) => e.definition.brand === brand);
}
