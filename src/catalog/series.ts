import { getAllProducts, isFeedImport } from '@/catalog';
import { getDiscipline } from './discipline';
import { isJuniorStick } from './similar';
import { SERIES, type SeriesDefinition } from './seriesDefinitions';
import type { Product } from './types';

export { SERIES, seriesPath, type SeriesDefinition } from './seriesDefinitions';

/**
 * The gate against thin pages for the series comparisons (wave 1, decision log
 * 2026-11-22). A series page is indexed only when the catalog can fill it:
 * - at least MIN_MEMBERS sticks are complete (hand-checked, active, same
 *   discipline and size group, with bow, carbon, lengths and indicative price);
 * - across those sticks at least MIN_DIMENSIONS properties differ;
 * - every two sticks differ in at least one property.
 * A stick that is not complete leaves the table and is listed as "nog niet
 * vergelijkbaar", with the reason. A series that fails the gate stays
 * reachable but gets noindex and no place in the sitemap. Shop prices play no
 * part: they change weekly, and the status of a page must not.
 */
export const MIN_MEMBERS = 3;
export const MIN_DIMENSIONS = 2;
/** Carbon differs from this many percentage points. */
export const CARBON_MIN_POINTS = 10;
/** A price differs from this many euros, and from this share of the higher price. */
export const PRICE_MIN_EUR = 25;
export const PRICE_MIN_SHARE = 0.1;

export type Dimension = 'niveau' | 'kromming' | 'carbon' | 'lengtes' | 'prijs';

/** The properties in which two sticks differ concretely. */
export function differingDimensions(a: Product, b: Product): Dimension[] {
  const out: Dimension[] = [];
  if (a.experienceLevel.value !== b.experienceLevel.value) out.push('niveau');
  if (a.bowProfile && b.bowProfile && a.bowProfile.value !== b.bowProfile.value) out.push('kromming');
  if (
    a.carbonPercentage &&
    b.carbonPercentage &&
    Math.abs(a.carbonPercentage.value - b.carbonPercentage.value) >= CARBON_MIN_POINTS
  ) {
    out.push('carbon');
  }
  const lengths = (p: Product) => [...new Set(p.lengthsInches.value)].sort((x, y) => x - y).join('/');
  if (lengths(a) !== lengths(b)) out.push('lengtes');
  const priceA = a.priceIndicativeEur.value;
  const priceB = b.priceIndicativeEur.value;
  const gap = Math.abs(priceA - priceB);
  if (gap >= PRICE_MIN_EUR && gap / Math.max(priceA, priceB) >= PRICE_MIN_SHARE) out.push('prijs');
  return out;
}

/** Why a stick cannot be in the table; empty when it can. */
export function missingForSeries(product: Product, definition: Pick<SeriesDefinition, 'discipline' | 'brand'>): string[] {
  const reasons: string[] = [];
  if (isFeedImport(product)) reasons.push('de gegevens zijn niet met de hand gecontroleerd');
  if (product.brand !== definition.brand) reasons.push('het is een ander merk');
  if (getDiscipline(product) !== definition.discipline) reasons.push('het is een andere soort stick');
  if (!product.bowProfile) reasons.push('de kromming (bow) staat niet in onze gegevens');
  if (!product.carbonPercentage) reasons.push('het carbonpercentage staat niet in onze gegevens');
  if (product.lengthsInches.value.length === 0) reasons.push('de lengtes staan niet in onze gegevens');
  if (!(product.priceIndicativeEur.value > 0)) reasons.push('de richtprijs staat niet in onze gegevens');
  return reasons;
}

export type SeriesStick = { product: Product; label: string };
export type SeriesEvaluation = {
  series: SeriesDefinition;
  /** The complete sticks, lowest carbon first, then lowest indicative price (the order of a range, not a ranking). */
  members: SeriesStick[];
  /** Sticks of the series that are in the catalog but not complete enough, or not in the catalog (active) at all. */
  notComparable: { label: string; slug: string; product: Product | null; reasons: string[] }[];
  /** The properties that differ somewhere in the series. */
  varying: Dimension[];
  /** Pairs that differ only in indicative price: the page says so, instead of inventing a difference. */
  priceOnlyPairs: [SeriesStick, SeriesStick][];
  indexable: boolean;
  /** Why the series is not indexable; empty when it is. */
  problems: string[];
};

/**
 * `findProduct` is for tests: by default the active, hand-checked sticks of the
 * catalog (a stick that is not active is not found).
 */
export function evaluateSeries(
  series: SeriesDefinition,
  now: Date = new Date(),
  findProduct?: (slug: string) => Product | undefined,
): SeriesEvaluation {
  const active = new Map(getAllProducts(now).map((p) => [p.slug, p] as const));
  const find = findProduct ?? ((slug: string) => active.get(slug));
  const complete: SeriesStick[] = [];
  const notComparable: SeriesEvaluation['notComparable'] = [];
  for (const { slug, label } of series.members) {
    const product = find(slug);
    if (!product) {
      notComparable.push({ label, slug, product: null, reasons: ['de stick staat op dit moment niet (meer) actief in onze catalogus'] });
      continue;
    }
    const reasons = missingForSeries(product, series);
    if (reasons.length > 0) notComparable.push({ label, slug, product, reasons });
    else complete.push({ product, label });
  }
  // One size group per page: a junior stick next to senior sticks is no comparison.
  const juniors = complete.filter((m) => isJuniorStick(m.product)).length;
  const sameGroup = juniors === 0 || juniors === complete.length;

  const members = [...complete].sort(
    (a, b) =>
      (a.product.carbonPercentage?.value ?? 0) - (b.product.carbonPercentage?.value ?? 0) ||
      a.product.priceIndicativeEur.value - b.product.priceIndicativeEur.value,
  );

  const varying = new Set<Dimension>();
  const priceOnlyPairs: [SeriesStick, SeriesStick][] = [];
  let everyPairDiffers = true;
  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const a = members[i]!;
      const b = members[j]!;
      const dims = differingDimensions(a.product, b.product);
      dims.forEach((d) => varying.add(d));
      if (dims.length === 0) everyPairDiffers = false;
      if (dims.length === 1 && dims[0] === 'prijs') priceOnlyPairs.push([a, b]);
    }
  }

  const problems: string[] = [];
  if (members.length < MIN_MEMBERS) problems.push(`minder dan ${MIN_MEMBERS} sticks met volledige gegevens (${members.length})`);
  if (!sameGroup) problems.push('junior- en seniorsticks door elkaar');
  if (varying.size < MIN_DIMENSIONS) problems.push(`de sticks verschillen in minder dan ${MIN_DIMENSIONS} eigenschappen`);
  if (!everyPairDiffers) problems.push('twee sticks verschillen in geen enkele eigenschap');

  return {
    series,
    members,
    notComparable,
    varying: (['niveau', 'kromming', 'carbon', 'lengtes', 'prijs'] as const).filter((d) => varying.has(d)),
    priceOnlyPairs,
    indexable: problems.length === 0,
    problems,
  };
}

export const getSeries = (slug: string): SeriesDefinition | undefined => SERIES.find((s) => s.slug === slug);

/** The series that are indexed: in the sitemap and linked from /vergelijk and the stick pages. */
export function indexableSeries(now: Date = new Date()): SeriesEvaluation[] {
  return SERIES.map((s) => evaluateSeries(s, now)).filter((e) => e.indexable);
}

/** The indexed series a stick belongs to, as a member or as a stick that is not yet comparable. */
export function seriesForProduct(product: Product, now: Date = new Date()): SeriesEvaluation[] {
  return indexableSeries(now).filter(
    (e) =>
      e.members.some((m) => m.product.slug === product.slug) ||
      e.notComparable.some((n) => n.slug === product.slug),
  );
}
