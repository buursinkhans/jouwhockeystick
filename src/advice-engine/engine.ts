import { CATALOG_VERSION } from '@/catalog';
import type { Product } from '@/catalog/types';
import type { AdviceAnswers } from './answers';
import { getCautions } from './cautions';
import {
  applyHardFilters,
  passesAllExcept,
  passesNonLengthFilters,
} from './hardFilters';
import { buildPlayerContext } from './playerContext';
import { deriveAdviceRules } from './productRules';
import { ADVICE_VERSION, METHOD_URL, RULE_SET_VERSION } from './ruleSetVersion';
import { scoreProduct, type SizeBasis } from './scoring';
import { findShorterSize, matchSize } from './sizeAdvice';
import type {
  AdviceResult,
  AdviceResultItem,
  NoAmbitiousReason,
  NoMatchReason,
  PlayerContext,
  ResultRole,
} from './types';

/** A best match needs at least this score out of 100 (spec §6.3). */
export const BEST_MATCH_MIN_SCORE = 70;
const AMBITIOUS_MIN_SCORE = 60;
const MAX_OTHER_SIZE_OPTIONS = 2;

type Candidate = Omit<AdviceResultItem, 'role' | 'cautions'> & {
  complexity: number;
};

function toCandidate(
  product: Product,
  ctx: PlayerContext,
  sizeInch: number,
  basis?: SizeBasis,
): Candidate {
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

function withRole(
  candidate: Candidate,
  role: ResultRole,
  ctx: PlayerContext,
): AdviceResultItem {
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

/** One responsible step up, and a smaller one while the basics are still forming. */
function stepUps(
  candidates: Candidate[],
  best: Candidate,
  ctx: PlayerContext,
): Candidate[] {
  const maxStep = ctx.learningControl ? 1 : 2;
  return candidates.filter(
    (candidate) =>
      candidate.complexity > best.complexity &&
      candidate.complexity <= best.complexity + maxStep,
  );
}

function noAmbitiousReason(
  results: AdviceResultItem[],
  ranked: Candidate[],
  ctx: PlayerContext,
): NoAmbitiousReason | null {
  const [best, ...rest] = ranked;
  if (!best || results.some((result) => result.role === 'ambitious_choice')) {
    return null;
  }
  const candidates = stepUps(rest, best, ctx);
  if (candidates.length === 0) {
    return 'no_step_up';
  }
  return candidates.some((candidate) => candidate.score >= AMBITIOUS_MIN_SCORE)
    ? 'brand_preference'
    : 'weak_fit';
}

function assignRoles(
  ranked: Candidate[],
  ctx: PlayerContext,
): AdviceResultItem[] {
  const [best, ...rest] = ranked;
  if (!best) {
    return [];
  }

  const results: AdviceResultItem[] = [
    withRole(
      best,
      best.score >= BEST_MATCH_MIN_SCORE ? 'best_match' : 'closest_option',
      ctx,
    ),
  ];

  const safe = rest.find(
    (candidate) => candidate.complexity <= best.complexity,
  );
  if (safe) {
    results.push(withRole(safe, 'safe_choice', ctx));
  }

  const ambitious = stepUps(rest, best, ctx).find(
    (candidate) => candidate !== safe && candidate.score >= AMBITIOUS_MIN_SCORE,
  );
  if (ambitious) {
    results.push(withRole(ambitious, 'ambitious_choice', ctx));
  }

  return results;
}

/**
 * Owner's rule: a player who wants to stay with a brand always gets a stick
 * of that brand as the first choice, and the best stick of another brand as
 * the alternative to compare with. When nothing of the brand passes the
 * filters, the budget and then the level are relaxed for that brand only,
 * each with a visible caution. Size, data, safety and availability are never
 * relaxed; then the advice says why the brand is missing.
 */
function brandFirstResults(
  ranked: Candidate[],
  products: Product[],
  ctx: PlayerContext,
): AdviceResultItem[] | null {
  const brand = ctx.preferredBrand;
  if (brand === null) {
    return null;
  }
  const own =
    ranked.find((candidate) => candidate.product.brand === brand) ??
    bestOfBrand(products, brand, ctx, ['budget']) ??
    bestOfBrand(products, brand, ctx, ['budget', 'experience']);
  if (!own) {
    return null;
  }
  const results = [withRole(own, 'same_brand', ctx)];
  const other = ranked.find((candidate) => candidate.product.brand !== brand);
  if (other) {
    results.push(withRole(other, 'other_brand', ctx));
  }
  return results;
}

function bestOfBrand(
  products: Product[],
  brand: Product['brand'],
  ctx: PlayerContext,
  relaxed: ReadonlyArray<'budget' | 'experience'>,
): Candidate | undefined {
  return products
    .filter(
      (product) =>
        product.brand === brand && passesAllExcept(product, ctx, relaxed),
    )
    .map((product) => toCandidate(product, ctx, sizeInchFor(product, ctx)))
    .sort(byScore)[0];
}

function sizeInchFor(product: Product, ctx: PlayerContext): number {
  return matchSize(product, ctx.sizeAdvice) === 'alternative' &&
    ctx.sizeAdvice.alternativeInch !== undefined
    ? ctx.sizeAdvice.alternativeInch
    : ctx.sizeAdvice.primaryInch;
}

/** The filter that no stick of the preferred brand passed (null = some did). */
function brandMissReason(
  products: Product[],
  ctx: PlayerContext,
): NoMatchReason | null {
  const brand = ctx.preferredBrand;
  return brand === null
    ? null
    : applyHardFilters(
        products.filter((product) => product.brand === brand),
        ctx,
      ).noMatchReason;
}

/**
 * Shorter-size fallback for when nothing exists in the advised size. These
 * are returned separately and never as a best match.
 */
function otherSizeOptions(
  products: Product[],
  ctx: PlayerContext,
): AdviceResultItem[] {
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
    | 'results'
    | 'otherSizeOptions'
    | 'isUncertain'
    | 'noMatchReason'
    | 'brandPreference'
    | 'noAmbitiousReason'
    | 'excludedCount'
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

  const { passed, excludedCount, noMatchReason } = applyHardFilters(
    products,
    ctx,
  );
  const ranked = passed
    .map((product) => toCandidate(product, ctx, sizeInchFor(product, ctx)))
    .sort(byScore);
  const brandResults = brandFirstResults(ranked, products, ctx);
  const brandPreference = (results: AdviceResultItem[]) =>
    ctx.preferredBrand
      ? {
          brand: ctx.preferredBrand,
          matched: results.some(
            (result) => result.product.brand === ctx.preferredBrand,
          ),
          missReason: brandMissReason(products, ctx),
        }
      : null;

  if (brandResults) {
    const first = brandResults[0];
    return {
      ...base,
      results: brandResults,
      otherSizeOptions: [],
      isUncertain:
        (first?.score ?? 0) < BEST_MATCH_MIN_SCORE ||
        ctx.sizeAdvice.confidence === 'low',
      noMatchReason: null,
      brandPreference: brandPreference(brandResults),
      noAmbitiousReason: null,
      excludedCount,
    };
  }

  if (passed.length === 0) {
    return {
      ...base,
      results: [],
      otherSizeOptions:
        noMatchReason === 'length' ? otherSizeOptions(products, ctx) : [],
      isUncertain: true,
      noMatchReason,
      brandPreference: brandPreference([]),
      noAmbitiousReason: null,
      excludedCount,
    };
  }

  const results = assignRoles(ranked, ctx);
  return {
    ...base,
    results,
    otherSizeOptions: [],
    isUncertain:
      results[0]?.role !== 'best_match' || ctx.sizeAdvice.confidence === 'low',
    noMatchReason: null,
    brandPreference: brandPreference(results),
    noAmbitiousReason: noAmbitiousReason(results, ranked, ctx),
    excludedCount,
  };
}
