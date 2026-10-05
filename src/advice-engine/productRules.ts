import { isProductActive } from '@/catalog';
import type { BowProfile, ExperienceLevel, Product } from '@/catalog/types';
import { HIGH_CARBON, SOFT_MAX_CARBON, feelFromCarbon } from './carbon';
import type { ExperienceBand, StickFeel } from './types';

export { HIGH_CARBON, SOFT_MAX_CARBON };

export const BAND_ORDER: readonly ExperienceBand[] = [
  'starter',
  'developing',
  'advanced',
];

/** Higher = more pronounced, more specialised curve. */
export const BOW_RANK: Record<BowProfile, number> = {
  ultrabow: 0,
  midbow: 1,
  dynabow: 1,
  probow: 2,
  lowbow: 3,
  extreme_lowbow: 4,
};

const BANDS_BY_LEVEL: Record<
  ExperienceLevel,
  { home: ExperienceBand; min: ExperienceBand; max: ExperienceBand }
> = {
  beginner: { home: 'starter', min: 'starter', max: 'developing' },
  gevorderd: { home: 'developing', min: 'developing', max: 'advanced' },
  ervaren: { home: 'advanced', min: 'advanced', max: 'advanced' },
};

const LEVEL_INDEX: Record<ExperienceLevel, number> = {
  beginner: 0,
  gevorderd: 1,
  ervaren: 2,
};

export type ProductAdviceRules = {
  homeBand: ExperienceBand;
  minBand: ExperienceBand;
  maxBand: ExperienceBand;
  starterAllowed: boolean;
  juniorModel: boolean;
  dragflickSpecialist: boolean;
  eliteOnly: boolean;
  /** Derived from the published carbon percentage; null when the brand doesn't publish one. */
  feel: StickFeel | null;
  /** Relative step-up in difficulty; used to pick the safe and ambitious choices. */
  complexity: number;
};

function carbonTier(
  carbon: number | undefined,
  level: ExperienceLevel,
): number {
  if (carbon === undefined) {
    // Unknown stiffness: fall back on the level the brand positions the stick for.
    return LEVEL_INDEX[level];
  }
  if (carbon <= SOFT_MAX_CARBON) {
    return 0;
  }
  if (carbon <= 60) {
    return 1;
  }
  return carbon < HIGH_CARBON ? 2 : 3;
}

/**
 * Advice rules are derived from sourced product data instead of being typed
 * in per product, so a product can never carry an advice flag that its own
 * specs contradict.
 */
export function deriveAdviceRules(product: Product): ProductAdviceRules {
  const level = product.experienceLevel.value;
  const bow = product.bowProfile?.value;
  const carbon = product.carbonPercentage?.value;
  const bands = BANDS_BY_LEVEL[level];
  const highCarbon = carbon !== undefined && carbon >= HIGH_CARBON;

  return {
    homeBand: bands.home,
    minBand: bands.min,
    maxBand: bands.max,
    starterAllowed:
      level === 'beginner' && bow !== 'extreme_lowbow' && !highCarbon,
    juniorModel: Math.min(...product.lengthsInches.value) < 36,
    dragflickSpecialist: bow === 'extreme_lowbow',
    eliteOnly: level === 'ervaren',
    feel: feelFromCarbon(carbon),
    complexity:
      (bow ? BOW_RANK[bow] : 0) +
      carbonTier(carbon, level) +
      LEVEL_INDEX[level],
  };
}

export type AdviceBlocker =
  | 'unverified'
  | 'missing_bow'
  | 'missing_lengths'
  | 'missing_core_source'
  | 'unavailable'
  | 'illogical_starter_flag';

function hasTraceableSource(
  sourced: { source: string; sourceUrl?: string } | undefined,
): boolean {
  if (!sourced) {
    return false;
  }
  return sourced.source !== 'editorial-estimate' || Boolean(sourced.sourceUrl);
}

/**
 * Publication checks from spec §11. A product with any blocker stays visible
 * in the catalog but is never used in an automated advice.
 *
 * Deliberate deviation (owner's decision, 2026-10-05): an unknown model year
 * is not a blocker. Many shop listings don't state one; such sticks are
 * weighed and offered like any other, with a visible "Modeljaar niet
 * bevestigd" caution instead.
 */
export function getAdviceBlockers(
  product: Product,
  now: Date = new Date(),
): AdviceBlocker[] {
  const blockers: AdviceBlocker[] = [];
  const carbon = product.carbonPercentage?.value;

  if (!isProductActive(product, now)) {
    blockers.push('unverified');
  }
  if (!product.bowProfile) {
    blockers.push('missing_bow');
  }
  if (product.lengthsInches.value.length === 0) {
    blockers.push('missing_lengths');
  }
  if (
    (product.bowProfile && !hasTraceableSource(product.bowProfile)) ||
    !hasTraceableSource(product.lengthsInches) ||
    !hasTraceableSource(product.priceIndicativeEur)
  ) {
    blockers.push('missing_core_source');
  }
  if (product.stock.value === 'unavailable') {
    blockers.push('unavailable');
  }
  if (
    product.experienceLevel.value === 'beginner' &&
    (product.bowProfile?.value === 'extreme_lowbow' ||
      (carbon !== undefined && carbon >= HIGH_CARBON))
  ) {
    blockers.push('illogical_starter_flag');
  }

  return blockers;
}
