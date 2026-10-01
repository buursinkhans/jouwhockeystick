import type { BowProfile, Product } from '@/catalog/types';
import type { AdviceAnswers, AdviceRoute, Goal, QuestionId } from './answers';
import { BOW_RANK, SOFT_MAX_CARBON, deriveAdviceRules } from './productRules';
import { matchSize } from './sizeAdvice';
import type { AdviceReason, PlayerContext, ScoreBreakdown, StickFeel } from './types';

type Weights = {
  size: number;
  experience: number;
  goal: number;
  bow: number;
  feel: number;
  budget: number;
  availability: number;
};

/**
 * Points per component and route (spec §6.2). The PRESTATIE column in the
 * spec adds up to 97; the remaining 3 points go to availability, the one
 * ScoreBreakdown component the table has no row for.
 */
export const ROUTE_WEIGHTS: Record<AdviceRoute, Weights> = {
  START: { size: 30, experience: 25, goal: 15, bow: 10, feel: 10, budget: 10, availability: 0 },
  ONTWIKKEL: { size: 25, experience: 20, goal: 20, bow: 15, feel: 10, budget: 10, availability: 0 },
  PRESTATIE: { size: 20, experience: 15, goal: 25, bow: 15, feel: 15, budget: 7, availability: 3 },
};

/**
 * Editorial advice rule: how well a bow profile generally supports a goal
 * (0–1). A general principle per profile, not a claim about one model.
 */
export const BOW_GOAL_SUPPORT: Record<BowProfile, Record<Goal, number>> = {
  ultrabow: { first_touch: 1, passing: 1, hit: 0.8, dribble_3d: 0.3, backhand: 0.6, aerial: 0.2, dragflick: 0, allround: 0.8 },
  midbow: { first_touch: 1, passing: 1, hit: 1, dribble_3d: 0.5, backhand: 0.7, aerial: 0.4, dragflick: 0.1, allround: 1 },
  dynabow: { first_touch: 0.9, passing: 1, hit: 0.9, dribble_3d: 0.6, backhand: 0.7, aerial: 0.5, dragflick: 0.2, allround: 1 },
  probow: { first_touch: 0.8, passing: 0.9, hit: 0.9, dribble_3d: 0.8, backhand: 0.8, aerial: 0.8, dragflick: 0.5, allround: 0.9 },
  lowbow: { first_touch: 0.6, passing: 0.7, hit: 0.7, dribble_3d: 1, backhand: 0.8, aerial: 1, dragflick: 0.8, allround: 0.6 },
  extreme_lowbow: { first_touch: 0.4, passing: 0.5, hit: 0.5, dribble_3d: 1, backhand: 0.7, aerial: 1, dragflick: 1, allround: 0.3 },
};

const START_BOW_FIT: Record<BowProfile, number> = {
  ultrabow: 1,
  midbow: 1,
  dynabow: 1,
  probow: 0.6,
  lowbow: 0.4,
  extreme_lowbow: 0,
};

const BOW_EXPERIENCE_RANK: Record<
  Exclude<NonNullable<AdviceAnswers['bow_experience']>, 'unknown'>,
  number
> = { standard: 0.5, pro_late: 2, low: 3, extreme_low: 4 };

const FEEL_INDEX: Record<StickFeel, number> = { soft: 0, balanced: 1, direct: 2 };

const NEUTRAL_GOAL_FIT = 0.7;
const GOAL_REASON_THRESHOLD = 0.75;
const BOW_REASON_THRESHOLD = 0.85;

export type SizeBasis = 'primary' | 'alternative' | 'other_size';
const SIZE_FIT: Record<SizeBasis, number> = { primary: 1, alternative: 0.6, other_size: 0.3 };

function experienceFit(product: Product, ctx: PlayerContext): { fit: number; controlFocus: boolean } {
  const rules = deriveAdviceRules(product);
  const bandFit = rules.homeBand === ctx.band ? 1 : 0.6;
  if (!ctx.learningControl) {
    return { fit: bandFit, controlFocus: false };
  }

  const carbon = product.carbonPercentage?.value;
  let controlFit: number;
  if (carbon === undefined) {
    // Unknown stiffness is judged on the level the brand positions the stick for.
    controlFit = rules.homeBand === 'starter' ? 1 : rules.homeBand === 'developing' ? 0.7 : 0.4;
  } else {
    controlFit = carbon <= SOFT_MAX_CARBON ? 1 : carbon <= 60 ? 0.7 : 0.4;
  }
  return {
    fit: bandFit * controlFit,
    controlFocus: carbon !== undefined && carbon <= SOFT_MAX_CARBON,
  };
}

function goalFit(bow: BowProfile, ctx: PlayerContext): { fit: number; supported: Goal[] } {
  if (ctx.goals.length === 0) {
    return { fit: NEUTRAL_GOAL_FIT, supported: [] };
  }
  const support = BOW_GOAL_SUPPORT[bow];
  const totalWeight = ctx.goals.reduce((sum, { weight }) => sum + weight, 0);
  const fit = ctx.goals.reduce((sum, { goal, weight }) => sum + support[goal] * weight, 0) / totalWeight;
  const supported = ctx.goals
    .filter(({ goal }) => support[goal] >= GOAL_REASON_THRESHOLD)
    .map(({ goal }) => goal);
  return { fit, supported };
}

function bowFit(bow: BowProfile, ctx: PlayerContext, goalFitValue: number): number {
  if (ctx.route === 'START') {
    return START_BOW_FIT[bow];
  }

  if (ctx.route === 'ONTWIKKEL') {
    if (bow === 'extreme_lowbow') {
      return 0.2;
    }
    if (bow === 'lowbow') {
      const wantsLift = ctx.goals.some(({ goal }) => goal === 'dribble_3d' || goal === 'aerial');
      return wantsLift ? 0.9 : 0.6;
    }
    return bow === 'ultrabow' ? 0.7 : 1;
  }

  // PRESTATIE: avoid a radical switch away from the profile the player knows.
  const experience = ctx.answers.bow_experience;
  let fit: number;
  if (experience && experience !== 'unknown') {
    const distance = Math.abs(BOW_EXPERIENCE_RANK[experience] - BOW_RANK[bow]);
    fit = distance <= 0.5 ? 1 : distance <= 1.5 ? 0.85 : distance <= 2.5 ? 0.55 : 0.3;
  } else {
    fit = Math.max(0.5, goalFitValue);
  }
  if (bow === 'extreme_lowbow' && ctx.answers.skill_dragflick !== 'specialist') {
    fit *= 0.5;
  }
  return fit;
}

function feelFit(product: Product, ctx: PlayerContext): { fit: number; exactMatch: boolean } {
  const productFeel = deriveAdviceRules(product).feel;
  if (productFeel === null) {
    // Unknown is neutral, never a mismatch — and never earns a "feel" reason.
    return { fit: 0.5, exactMatch: false };
  }
  if (ctx.feelPreference === null) {
    return { fit: 0.7, exactMatch: false };
  }

  const distance = Math.abs(FEEL_INDEX[productFeel] - FEEL_INDEX[ctx.feelPreference]);
  let fit = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.1;
  if (ctx.answers.vibration_sensitivity === 'yes' && productFeel === 'direct') {
    fit *= 0.6;
  }
  return { fit, exactMatch: distance === 0 };
}

function budgetFit(product: Product, ctx: PlayerContext): { fit: number; inBand: boolean } {
  if (ctx.budget === null) {
    return { fit: 0.7, inBand: false };
  }
  const price = product.priceIndicativeEur.value;
  if (price >= ctx.budget.minEur) {
    return { fit: 1, inBand: true };
  }
  return { fit: ctx.route === 'START' ? 0.9 : 0.8, inBand: false };
}

function goalQuestionIds(ctx: PlayerContext): QuestionId[] {
  if (ctx.route === 'START') {
    return ['fun_style'];
  }
  return ctx.route === 'ONTWIKKEL'
    ? ['primary_goals', 'fun_style']
    : ['primary_goals', 'match_actions_frequency'];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Scores a product that already passed the hard filters. Commercial fields
 * (margin, affiliate, sponsoring) are deliberately not an input here.
 */
export function scoreProduct(
  product: Product,
  ctx: PlayerContext,
  sizeBasisOverride?: SizeBasis,
): { breakdown: ScoreBreakdown; reasons: AdviceReason[] } {
  const weights = ROUTE_WEIGHTS[ctx.route];
  const bow = product.bowProfile?.value ?? 'midbow';
  const sizeMatch = matchSize(product, ctx.sizeAdvice);
  const sizeBasis: SizeBasis = sizeBasisOverride ?? (sizeMatch === 'alternative' ? 'alternative' : 'primary');

  const experience = experienceFit(product, ctx);
  const goal = goalFit(bow, ctx);
  const bowFitValue = bowFit(bow, ctx, goal.fit);
  const feel = feelFit(product, ctx);
  const budget = budgetFit(product, ctx);
  const availability = product.stock.value === 'available' ? 1 : 0.5;

  const reasons: AdviceReason[] = [];
  if (sizeBasis === 'primary') {
    reasons.push({
      code: 'SIZE_AVAILABLE',
      evidence: { kind: 'spec', field: 'lengthsInches' },
      inch: ctx.sizeAdvice.primaryInch,
    });
  } else if (sizeBasis === 'alternative') {
    reasons.push({
      code: 'SIZE_ALTERNATIVE',
      evidence: { kind: 'spec', field: 'lengthsInches' },
      inch: ctx.sizeAdvice.alternativeInch,
    });
  }
  reasons.push({ code: 'EXPERIENCE_FIT', evidence: { kind: 'spec', field: 'experienceLevel' } });
  if (experience.controlFocus) {
    reasons.push({ code: 'CONTROL_FOCUS', evidence: { kind: 'spec', field: 'carbonPercentage' } });
  }
  if (goal.supported.length > 0 && goal.fit >= GOAL_REASON_THRESHOLD) {
    reasons.push({
      code: 'GOAL_FIT',
      evidence: { kind: 'rule', basedOn: goalQuestionIds(ctx) },
      goals: goal.supported,
    });
  }
  if (product.bowProfile && bowFitValue >= BOW_REASON_THRESHOLD) {
    reasons.push({ code: 'BOW_FIT', evidence: { kind: 'spec', field: 'bowProfile' } });
  }
  if (feel.exactMatch && ctx.route !== 'START') {
    reasons.push({ code: 'FEEL_FIT', evidence: { kind: 'spec', field: 'carbonPercentage' } });
  }
  if (ctx.budget !== null) {
    reasons.push({
      code: budget.inBand ? 'BUDGET_FIT' : 'BUDGET_BELOW',
      evidence: { kind: 'spec', field: 'priceIndicativeEur' },
    });
  }
  if (reasons.length < 3 && product.bowProfile) {
    reasons.push({ code: 'SPECS_VERIFIED', evidence: { kind: 'spec', field: 'bowProfile' } });
  }

  const breakdown: ScoreBreakdown = {
    sizeFit: round1(weights.size * SIZE_FIT[sizeBasis]),
    experienceFit: round1(weights.experience * experience.fit),
    skillGoalFit: round1(weights.goal * goal.fit),
    bowFit: round1(weights.bow * bowFitValue),
    feelFit: round1(weights.feel * feel.fit),
    budgetFit: round1(weights.budget * budget.fit),
    availabilityFit: round1(weights.availability * availability),
    total: 0,
    explanationTags: reasons.map((reason) => reason.code),
  };
  breakdown.total = round1(
    breakdown.sizeFit +
      breakdown.experienceFit +
      breakdown.skillGoalFit +
      breakdown.bowFit +
      breakdown.feelFit +
      breakdown.budgetFit +
      breakdown.availabilityFit,
  );

  return { breakdown, reasons };
}
