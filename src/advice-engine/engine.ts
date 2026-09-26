import type { Product } from '@/catalog/types';
import { applyHardFilters, filterByAvailability, filterByVerification } from './hardFilters';
import { RULE_SET_VERSION } from './ruleSetVersion';
import { scoreProduct } from './scoring';
import type { AdviceResult, QuizProfile, ScoredProduct } from './types';

/** Score gap below which the top two results are treated as too close to call. */
const UNCERTAINTY_SCORE_GAP = 10;
const MAX_ALTERNATIVES = 3;

function rank(products: Product[], profile: QuizProfile): ScoredProduct[] {
  return [...products]
    .map((product) => scoreProduct(product, profile))
    .sort((a, b) => b.score - a.score);
}

/**
 * Fallback used when no product survives the hard filters (e.g. conflicting
 * budget/length signals). Relaxes length and budget but keeps verification
 * and availability, so we never show an unverified or out-of-stock product
 * as a fallback — and always mark the result as uncertain instead of
 * fabricating false precision.
 */
function fallbackCandidates(products: Product[], now: Date): Product[] {
  return filterByAvailability(filterByVerification(products, now));
}

export function getAdvice(
  profile: QuizProfile,
  products: Product[],
  now: Date = new Date(),
): AdviceResult {
  const { passed, excludedCount, noMatchReason } = applyHardFilters(products, profile, now);

  const base: Pick<AdviceResult, 'ruleSetVersion' | 'generatedAt' | 'profile' | 'excludedCount'> = {
    ruleSetVersion: RULE_SET_VERSION,
    generatedAt: now.toISOString(),
    profile,
    excludedCount,
  };

  if (passed.length === 0) {
    const fallback = rank(fallbackCandidates(products, now), profile).slice(0, MAX_ALTERNATIVES);
    return {
      ...base,
      recommended: null,
      alternatives: fallback,
      isUncertain: true,
      noMatchReason,
    };
  }

  const ranked = rank(passed, profile);
  const [top, second] = ranked;

  if (!top) {
    return { ...base, recommended: null, alternatives: [], isUncertain: true, noMatchReason };
  }

  const scoreGap = second ? top.score - second.score : Number.POSITIVE_INFINITY;
  const isUncertain = passed.length === 1 || scoreGap < UNCERTAINTY_SCORE_GAP;

  return {
    ...base,
    recommended: top,
    alternatives: ranked.slice(1, 1 + MAX_ALTERNATIVES),
    isUncertain,
    noMatchReason: null,
  };
}
