import type { ExperienceLevel, Product } from '@/catalog/types';
import type { AdviceAnswers } from './answers';

export const NOW = new Date('2026-09-22T12:00:00.000Z');

const VERIFIED = '2026-06-01';

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    slug: 'test-product',
    brand: 'Grays',
    name: 'Test Product',
    dataStatus: 'test-data',
    imageAlt: 'Test product',
    experienceLevel: {
      value: 'beginner',
      source: 'brand-website',
      modelYear: 2025,
      lastVerifiedAt: VERIFIED,
    },
    recommendedPositions: {
      value: ['middenvelder'],
      source: 'editorial-estimate',
      lastVerifiedAt: VERIFIED,
    },
    bowProfile: {
      value: 'midbow',
      source: 'brand-website',
      lastVerifiedAt: VERIFIED,
    },
    carbonPercentage: {
      value: 10,
      source: 'brand-website',
      lastVerifiedAt: VERIFIED,
    },
    lengthsInches: {
      value: [30, 34, 36.5],
      source: 'brand-website',
      lastVerifiedAt: VERIFIED,
    },
    priceIndicativeEur: {
      value: 89.95,
      source: 'brand-website',
      lastVerifiedAt: VERIFIED,
    },
    stock: {
      value: 'available',
      source: 'editorial-estimate',
      lastVerifiedAt: VERIFIED,
    },
    summary: 'Test product summary.',
    strengths: {
      value: ['Test sterk punt'],
      source: 'editorial-estimate',
      lastVerifiedAt: VERIFIED,
    },
    pointsOfAttention: {
      value: ['Test aandachtspunt'],
      source: 'editorial-estimate',
      lastVerifiedAt: VERIFIED,
    },
    ...overrides,
  };
}

/** Shorthand for the sourced fields tests override most often. */
export const sourced = {
  level: (value: ExperienceLevel): Product['experienceLevel'] => ({
    value,
    source: 'brand-website',
    modelYear: 2025,
    lastVerifiedAt: VERIFIED,
  }),
  bow: (
    value: NonNullable<Product['bowProfile']>['value'],
  ): Product['bowProfile'] => ({
    value,
    source: 'brand-website',
    lastVerifiedAt: VERIFIED,
  }),
  carbon: (value: number): Product['carbonPercentage'] => ({
    value,
    source: 'brand-website',
    lastVerifiedAt: VERIFIED,
  }),
  lengths: (value: number[]): Product['lengthsInches'] => ({
    value,
    source: 'brand-website',
    lastVerifiedAt: VERIFIED,
  }),
  price: (value: number): Product['priceIndicativeEur'] => ({
    value,
    source: 'brand-website',
    lastVerifiedAt: VERIFIED,
  }),
  stock: (value: Product['stock']['value']): Product['stock'] => ({
    value,
    source: 'editorial-estimate',
    lastVerifiedAt: VERIFIED,
  }),
};

/** Acceptance scenario 1 (spec §12): first stick for a child. */
export function buildStartAnswers(
  overrides: Partial<AdviceAnswers> = {},
): AdviceAnswers {
  return {
    advice_goal: 'child',
    route_self_select: 'first_stick',
    age_band: '8_10',
    experience_seasons: 'lt_1',
    height_cm: 132,
    core_skills_stage: 'practicing_basics',
    fun_style: 'join_everywhere',
    has_current_stick: 'no',
    replacement_reason: 'first_stick',
    budget_band: '75_125',
    left_handed_requirement: 'no',
    ...overrides,
  };
}

/** Acceptance scenario 2: youth player in development. */
export function buildDevelopAnswers(
  overrides: Partial<AdviceAnswers> = {},
): AdviceAnswers {
  return {
    advice_goal: 'child',
    route_self_select: 'next_stick',
    age_band: '13_15',
    experience_seasons: '2_3',
    height_cm: 154,
    first_touch_confidence: 'mostly_good',
    core_skills_stage: 'basics_mostly_good',
    primary_goals: ['passing', 'dribble_3d'],
    fun_style: 'dribble_actions',
    feel_preference: 'balanced',
    has_current_stick: 'yes',
    replacement_reason: 'next_step',
    budget_band: '125_175',
    left_handed_requirement: 'no',
    ...overrides,
  };
}

/** Acceptance scenario 3: advanced attacker without a dragflick role. */
export function buildPerformanceAnswers(
  overrides: Partial<AdviceAnswers> = {},
): AdviceAnswers {
  return {
    advice_goal: 'self',
    route_self_select: 'advanced_compare',
    age_band: '16_18',
    experience_seasons: '4_plus',
    height_cm: 174,
    first_touch_confidence: 'good_under_pressure',
    primary_goals: ['dribble_3d', 'backhand'],
    match_actions_frequency: ['three_d', 'backhand'],
    skill_flat_pass: 4,
    skill_hit: 3,
    skill_dribble_3d: 4,
    skill_aerial: 'developing',
    skill_backhand: 'regular',
    skill_dragflick: 'none',
    feel_preference: 'direct',
    has_current_stick: 'yes',
    replacement_reason: 'next_step',
    budget_band: '175_250',
    left_handed_requirement: 'no',
    ...overrides,
  };
}
