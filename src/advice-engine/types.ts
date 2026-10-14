import type { Product, Brand } from '@/catalog/types';
import type { AdviceAnswers, AdviceRoute, Goal, QuestionId } from './answers';
import type { SizeAdvice } from './sizeAdvice';

export type ExperienceBand = 'starter' | 'developing' | 'advanced';
export type StickFeel = 'soft' | 'balanced' | 'direct';

/** How the player's level was set (shown on the result). */
export type LevelBasis = {
  /** Where the starting level came from. */
  base: 'first_season' | 'age' | 'seasons';
  /** One level up for a performance signal. */
  steppedUp: boolean;
};

/** Product fields a reason can point at, so the UI can show that field's source and check date. */
export type SpecField =
  | 'lengthsInches'
  | 'experienceLevel'
  | 'bowProfile'
  | 'carbonPercentage'
  | 'priceIndicativeEur';

export type ReasonCode =
  | 'SIZE_AVAILABLE'
  | 'SIZE_ALTERNATIVE'
  | 'EXPERIENCE_FIT'
  | 'CONTROL_FOCUS'
  | 'GOAL_FIT'
  | 'BOW_FIT'
  | 'FEEL_FIT'
  | 'BUDGET_FIT'
  | 'BUDGET_BELOW'
  | 'SPECS_VERIFIED'
  | 'BRAND_PREFERENCE';

/**
 * Every reason is traceable: either to a sourced product field or to an
 * editorial advice rule plus the answers that rule was applied to.
 */
export type ReasonEvidence =
  { kind: 'spec'; field: SpecField } | { kind: 'rule'; basedOn: QuestionId[] };

export type AdviceReason = {
  code: ReasonCode;
  evidence: ReasonEvidence;
  inch?: number;
  goals?: Goal[];
};

export type CautionCode =
  | 'OTHER_SIZE'
  | 'AMBITIOUS_STEP'
  | 'HIGH_CARBON_STEP'
  | 'LOWBOW_TRADEOFF'
  | 'LESS_POWER'
  | 'CARBON_UNKNOWN'
  | 'MODEL_YEAR_UNCONFIRMED'
  | 'BIG_BOW_CHANGE'
  | 'DIRECT_FEEL_VIBRATION'
  | 'ABOVE_BUDGET'
  | 'LEVEL_MISMATCH'
  /** The stick is meant for a simpler level than the player's. */
  | 'BELOW_LEVEL';

/**
 * Points per component (already weighted for the route); `total` is 0–100.
 * Size is not a component: it is checked as a hard filter.
 */
export type ScoreBreakdown = {
  experienceFit: number;
  skillGoalFit: number;
  feelFit: number;
  bowFit: number;
  budgetFit: number;
  availabilityFit: number;
  /** Extra points for the brand the player wants to stay with (0 otherwise). */
  brandFit: number;
  total: number;
  explanationTags: ReasonCode[];
};

/**
 * `closest_option` is shown instead of `best_match` when the top score stays
 * below the best-match threshold. `other_size` is a shorter-size fallback
 * and is never presented as a match.
 */
export type ResultRole =
  | 'best_match'
  | 'safe_choice'
  | 'ambitious_choice'
  | 'closest_option'
  | 'other_size'
  /** Shown when the player wants to stay with a brand: one stick of another brand to compare. */
  | 'other_brand'
  /** The best stick of the preferred brand, when it fits reasonably but is not among the top results. */
  | 'same_brand';

export type AdviceResultItem = {
  role: ResultRole;
  product: Product;
  /** The stick length this result is advised in. */
  sizeInch: number;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: AdviceReason[];
  cautions: CautionCode[];
};

/** The first hard-filter stage that left no candidates. */
/** Why the advice has no ambitious choice (shown to the player). */
export type NoAmbitiousReason =
  /** No stick in size and budget is a responsible step up from the best match. */
  | 'no_step_up'
  /** Step-up sticks exist but fit the answers too poorly. */
  | 'weak_fit'
  /** It made way for a stick of the current or another brand. */
  | 'brand_preference';

export type NoMatchReason =
  'data' | 'length' | 'experience' | 'safety' | 'budget' | 'availability';

export type WeightedGoal = { goal: Goal; weight: number };

/** Normalized, engine-facing view of the answers. */
export type PlayerContext = {
  answers: AdviceAnswers;
  route: AdviceRoute;
  /** Player level from the answers (age, seasons, performance signals), not from the route. */
  band: ExperienceBand;
  levelBasis: LevelBasis;
  sizeAdvice: SizeAdvice;
  goals: WeightedGoal[];
  /** Still building first touch / basics: control weighs heavier than stiffness. */
  learningControl: boolean;
  /** First touch rated in the lower half ("leren" or "meestal goed"). */
  firstTouchLow: boolean;
  feelPreference: StickFeel | null;
  hasDragflickRole: boolean;
  budget: { minEur: number; maxEur: number } | null;
  /** Brand of the current stick the player wants to stay with, if any. */
  preferredBrand: Brand | null;
  now: Date;
};

export type AdviceResult = {
  adviceSessionId: string;
  adviceVersion: string;
  ruleSetVersion: string;
  catalogVersion: string;
  generatedAt: string;
  route: AdviceRoute;
  /** The level the advice was made for, and how it was set from the answers. */
  playerLevel: { band: ExperienceBand; basis: LevelBasis };
  sizeAdvice: SizeAdvice;
  /** At most three: best match (or closest option), safe choice, ambitious choice. */
  results: AdviceResultItem[];
  /** Only filled when nothing exists in the advised size. */
  otherSizeOptions: AdviceResultItem[];
  isUncertain: boolean;
  noMatchReason: NoMatchReason | null;
  /**
   * Set when the player asked to stay with a brand; `matched` = a stick of it
   * is in the advice, otherwise `missReason` is the filter no stick of it passed.
   */
  brandPreference: {
    brand: Brand;
    matched: boolean;
    missReason: NoMatchReason | null;
  } | null;
  /** Null when an ambitious choice is shown or there are no results. */
  noAmbitiousReason: NoAmbitiousReason | null;
  /**
   * The stick that fits the player best when it does not exist in the
   * advised size and is clearly better than the best stick that does
   * (`higher_level`: it is at the player's level and the sticks in the size
   * are simpler; `better_fit`: a clear score lead). Null otherwise.
   */
  bestModelOtherSize: {
    product: Product;
    score: number;
    reason: 'higher_level' | 'better_fit';
  } | null;
  excludedCount: number;
  methodUrl: string;
};
