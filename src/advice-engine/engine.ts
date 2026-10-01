import { CATALOG_VERSION } from '@/catalog';
import type { Product } from '@/catalog/types';
import type { AdviceAnswers } from './answers';
import { getCautions } from './cautions';
import { applyHardFilters, passesNonLengthFilters } from './hardFilters';
import { buildPlayerContext } from './playerContext';
import { deriveAdviceRules } from './productRules';
import { ADVICE_VERSION, METHOD_URL, RULE_SET_VERSION } from './ruleSetVersion';
import { scoreProduct, type SizeBasis } from './scoring';
import { findShorterSize, matchSize } from './sizeAdvice';
import type { AdviceResult, AdviceResultItem, PlayerContext, ResultRole } from './types';

/** A best match needs at least this score out of 100 (spec §6.3). */
export const BEST_MATCH_MIN_SCORE = 70;
const AMBITIOUS_MIN_SCORE = 60;
const MAX_OTHER_SIZE_OPTIONS = 2;

type Candidate = Omit<AdviceResultItem, 'role' | 'cautions'> & { complexity: number };

function toCandidate(product: Product, ctx: PlayerContext, sizeInch: number, basis?: SizeBasis): Candidate {
  const { breakdown, reasons } = scoreProduct(product, ctx, basis);
  return {
    product,
    sizeInch,
    score: breakdown.total,
    breakdown,
    reasons,
    complexity: deriveAdviceRules(product).complexity,
  };
}

/** Ties go to the simpler, then the cheaper stick — never to a commercial factor. */
function byScore(a: Candidate, b: Candidate): number {
  return (
    b.score - a.score ||
    a.complexity - b.complexity ||
    a.product.priceIndicativeEur.value - b.product.priceIndicativeEur.value ||
    a.product.slug.localeCompare(b.product.slug)
  );
}

function withRole(candidate: Candidate, role: ResultRole, ctx: PlayerContext): AdviceResultItem {
  return {
    role,
    product: candidate.product,
    sizeInch: candidate.sizeInch,
    score: candidate.score,
    breakdown: candidate.breakdown,
    reasons: candidate.reasons,
    cautions: getCautions(candidate.product, ctx, role),
  };
}

function assignRoles(ranked: Candidate[], ctx: PlayerContext): AdviceResultItem[] {
  const [best, ...rest] = ranked;
  if (!best) {
    return [];
  }

  const results: AdviceResultItem[] = [
    withRole(best, best.score >= BEST_MATCH_MIN_SCORE ? 'best_match' : 'closest_option', ctx),
  ];

  const safe = rest.find((candidate) => candidate.complexity <= best.complexity);
  if (safe) {
    results.push(withRole(safe, 'safe_choice', ctx));
  }

  // One responsible step up, and a smaller one while the basics are still forming.
  const maxStep = ctx.learningControl ? 1 : 2;
  const ambitious = rest.find(
    (candidate) =>
      candidate !== safe &&
      candidate.score >= AMBITIOUS_MIN_SCORE &&
      candidate.complexity > best.complexity &&
      candidate.complexity <= best.complexity + maxStep,
  );
  if (ambitious) {
    results.push(withRole(ambitious, 'ambitious_choice', ctx));
  }

  return results;
}

/**
 * Shorter-size fallback for when nothing exists in the advised size. These
 * are returned separately and never as a best match.
 */
function otherSizeOptions(products: Product[], ctx: PlayerContext): AdviceResultItem[] {
  const candidates: Candidate[] = [];
  for (const product of products) {
    const shorter = findShorterSize(product, ctx.sizeAdvice);
    if (shorter !== undefined && passesNonLengthFilters(product, ctx)) {
      candidates.push(toCandidate(product, ctx, shorter, 'other_size'));
    }
  }
  return candidates
    .sort(byScore)
    .slice(0, MAX_OTHER_SIZE_OPTIONS)
    .map((candidate) => withRole(candidate, 'other_size', ctx));
}

export function getAdvice(
  answers: AdviceAnswers,
  products: Product[],
  options: { now?: Date; adviceSessionId?: string } = {},
): AdviceResult {
  const now = options.now ?? new Date();
  const ctx = buildPlayerContext(answers, now);

  const base: Omit<
    AdviceResult,
    'results' | 'otherSizeOptions' | 'isUncertain' | 'noMatchReason' | 'referral' | 'excludedCount'
  > = {
    adviceSessionId: options.adviceSessionId ?? '',
    adviceVersion: ADVICE_VERSION,
    ruleSetVersion: RULE_SET_VERSION,
    catalogVersion: CATALOG_VERSION,
    generatedAt: now.toISOString(),
    route: ctx.route,
    sizeAdvice: ctx.sizeAdvice,
    methodUrl: METHOD_URL,
  };

  // The catalog only holds regular (right-handed) sticks: showing any of them
  // here would be showing a wrong product.
  if (answers.left_handed_requirement === 'yes') {
    return {
      ...base,
      results: [],
      otherSizeOptions: [],
      isUncertain: true,
      noMatchReason: null,
      referral: 'left_handed',
      excludedCount: products.length,
    };
  }

  const { passed, excludedCount, noMatchReason } = applyHardFilters(products, ctx);

  if (passed.length === 0) {
    return {
      ...base,
      results: [],
      otherSizeOptions: noMatchReason === 'length' ? otherSizeOptions(products, ctx) : [],
      isUncertain: true,
      noMatchReason,
      referral: null,
      excludedCount,
    };
  }

  const ranked = passed
    .map((product) => {
      const sizeInch =
        matchSize(product, ctx.sizeAdvice) === 'alternative' && ctx.sizeAdvice.alternativeInch !== undefined
          ? ctx.sizeAdvice.alternativeInch
          : ctx.sizeAdvice.primaryInch;
      return toCandidate(product, ctx, sizeInch);
    })
    .sort(byScore);
  const results = assignRoles(ranked, ctx);

  return {
    ...base,
    results,
    otherSizeOptions: [],
    isUncertain: results[0]?.role !== 'best_match' || ctx.sizeAdvice.confidence === 'low',
    noMatchReason: null,
    referral: null,
    excludedCount,
  };
}
