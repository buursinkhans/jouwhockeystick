import type { Product } from '@/catalog/types';
import type { AdviceAnswers, AdviceRoute, Goal, QuestionId } from './answers';
import type { SizeAdvice } from './sizeAdvice';

export type ExperienceBand = 'starter' | 'developing' | 'advanced';
export type StickFeel = 'soft' | 'balanced' | 'direct';

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
  | 'SPECS_VERIFIED';

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
  | 'DIRECT_FEEL_VIBRATION';

/** Points per component (already weighted for the route); `total` is 0–100. */
export type ScoreBreakdown = {
  sizeFit: number;
  experienceFit: number;
  skillGoalFit: number;
  feelFit: number;
  bowFit: number;
  budgetFit: number;
  availabilityFit: number;
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
  | 'other_size';

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
export type NoMatchReason =
  'data' | 'length' | 'experience' | 'safety' | 'budget' | 'availability';

export type WeightedGoal = { goal: Goal; weight: number };

/** Normalized, engine-facing view of the answers. */
export type PlayerContext = {
  answers: AdviceAnswers;
  route: AdviceRoute;
  band: ExperienceBand;
  sizeAdvice: SizeAdvice;
  goals: WeightedGoal[];
  /** Still building first touch / basics: control weighs heavier than stiffness. */
  learningControl: boolean;
  /** First touch rated in the lower half ("leren" or "meestal goed"). */
  firstTouchLow: boolean;
  feelPreference: StickFeel | null;
  hasDragflickRole: boolean;
  budget: { minEur: number; maxEur: number } | null;
  now: Date;
};

export type AdviceResult = {
  adviceSessionId: string;
  adviceVersion: string;
  ruleSetVersion: string;
  catalogVersion: string;
  generatedAt: string;
  route: AdviceRoute;
  sizeAdvice: SizeAdvice;
  /** At most three: best match (or closest option), safe choice, ambitious choice. */
  results: AdviceResultItem[];
  /** Only filled when nothing exists in the advised size. */
  otherSizeOptions: AdviceResultItem[];
  isUncertain: boolean;
  noMatchReason: NoMatchReason | null;
  /** Set when the keuzehulp should not show products at all and refer to personal help instead. */
  referral: 'left_handed' | null;
  excludedCount: number;
  methodUrl: string;
};
