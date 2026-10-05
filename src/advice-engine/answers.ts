import { z } from 'zod';

export const adviceRouteSchema = z.enum(['START', 'ONTWIKKEL', 'PRESTATIE']);
export type AdviceRoute = z.infer<typeof adviceRouteSchema>;

export const goalSchema = z.enum([
  'first_touch',
  'passing',
  'hit',
  'dribble_3d',
  'backhand',
  'aerial',
  'dragflick',
  'allround',
]);
export type Goal = z.infer<typeof goalSchema>;

export const routeSelfSelectSchema = z.enum([
  'first_stick',
  'next_stick',
  'advanced_compare',
]);
export const ageBandSchema = z.enum([
  'under_8',
  '8_10',
  '11_12',
  '13_15',
  '16_18',
  '18_plus',
]);
export const experienceSeasonsSchema = z.enum([
  'trial',
  'lt_1',
  '1',
  '2_3',
  '4_plus',
]);
export const firstTouchSchema = z.enum([
  'learning',
  'mostly_good',
  'good_under_pressure',
  'very_confident',
]);
export const coreSkillsSchema = z.enum([
  'practicing_basics',
  'basics_mostly_good',
  'refining_actions',
]);
export const funStyleSchema = z.enum([
  'build_pass',
  'join_everywhere',
  'dribble_actions',
  'finishing',
  'defend_intercept',
]);
export const matchActionSchema = z.enum([
  'hard_flats',
  'tempo_passes',
  'hit',
  'backhand',
  'three_d',
  'lift',
  'aerial',
  'dragflick',
]);
export const feelPreferenceSchema = z.enum([
  'soft',
  'balanced',
  'direct',
  'unknown',
]);
export const bowExperienceSchema = z.enum([
  'standard',
  'pro_late',
  'low',
  'extreme_low',
  'unknown',
]);
export const budgetBandSchema = z.enum([
  'lt_75',
  '75_125',
  '125_175',
  '175_250',
  'gt_250',
  'compare_first',
]);
export const currentStickProblemSchema = z.enum([
  'too_heavy',
  'too_light',
  'too_hard',
  'too_soft',
  'hard_to_receive',
  'little_power',
  'hard_to_lift',
  'too_short',
  'too_long',
  'damaged',
  'outgrown',
  'unknown',
]);

const skillRatingSchema = z.number().int().min(1).max(5);
const yesNoUnknownSchema = z.enum(['yes', 'no', 'unknown']);

/**
 * Raw answers as submitted by the keuzehulp. Every key is a question id from
 * the implementation spec (§3). Which questions are required depends on the
 * route, so the per-field schemas are optional and `superRefine` enforces
 * the route-specific required set.
 */
const answersShape = {
  // A. Start en route
  advice_goal: z.enum(['self', 'child', 'other']),
  route_self_select: routeSelfSelectSchema,
  age_band: ageBandSchema,
  experience_seasons: experienceSeasonsSchema,
  // B. Maat en fysieke fit
  height_cm: z.number().int().min(95).max(210),
  height_uncertain: z.enum(['yes', 'no']).optional(),
  current_length_inch: z
    .enum([
      '24',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36.5',
      'unknown',
    ])
    .optional(),
  junior_grip_needed: yesNoUnknownSchema.optional(),
  // C. Ervaring en technische basis
  first_touch_confidence: firstTouchSchema.optional(),
  core_skills_stage: coreSkillsSchema.optional(),
  playing_level: z
    .enum([
      'training_trial',
      'youth_recreational',
      'breedte',
      'selection',
      'senior_recreational',
      'senior_competitive',
      'top',
    ])
    .optional(),
  training_frequency: z.enum(['1', '2', '3', '4_plus']).optional(),
  // D. Speelstijl en ontwikkeldoelen
  primary_goals: z.array(goalSchema).max(2).optional(),
  fun_style: funStyleSchema.optional(),
  positions: z.enum(['defence', 'midfield', 'attack', 'varying']).optional(),
  match_actions_frequency: z.array(matchActionSchema).max(3).optional(),
  // E. Techniek per actie
  skill_flat_pass: skillRatingSchema.optional(),
  skill_hit: skillRatingSchema.optional(),
  skill_dribble_3d: skillRatingSchema.optional(),
  skill_aerial: z
    .enum(['never', 'developing', 'regular', 'key_weapon'])
    .optional(),
  skill_backhand: z
    .enum(['rarely', 'sometimes', 'regular', 'very_important'])
    .optional(),
  skill_dragflick: z
    .enum(['none', 'practicing', 'sometimes', 'specialist'])
    .optional(),
  // F. Stickgevoel en materiaalvoorkeur
  feel_preference: feelPreferenceSchema.optional(),
  stick_weight_preference: z
    .enum(['light', 'balanced', 'sturdy', 'unknown'])
    .optional(),
  bow_experience: bowExperienceSchema.optional(),
  vibration_sensitivity: z
    .enum(['yes', 'sometimes', 'no', 'unknown'])
    .optional(),
  // G. Huidige stick en reden van vervanging
  has_current_stick: z.enum(['yes', 'no']),
  current_stick_like: z
    .array(
      z.enum([
        'control',
        'power',
        'weight',
        'dribbling',
        'looks',
        'nothing_special',
      ]),
    )
    .max(2)
    .optional(),
  current_stick_problem: z.array(currentStickProblemSchema).max(2).optional(),
  replacement_reason: z.enum([
    'first_stick',
    'outgrown',
    'damaged',
    'next_step',
    'new_season',
    'other',
  ]),
  // H. Budget, voorraad en koopvoorkeur
  budget_band: budgetBandSchema,
  purchase_timing: z
    .enum(['this_week', 'within_2_weeks', 'before_season', 'orienting'])
    .optional(),
  availability_preference: z
    .enum(['only_direct', 'best_match_later', 'no_preference'])
    .optional(),
  // I. Context en uitzonderingen
  left_handed_requirement: yesNoUnknownSchema,
};

const baseAnswersSchema = z.object(answersShape);
export type AdviceAnswers = z.infer<typeof baseAnswersSchema>;
export type QuestionId = keyof AdviceAnswers;

const ALL_ROUTES = ['START', 'ONTWIKKEL', 'PRESTATIE'] as const;

type QuestionMeta = { routes: readonly AdviceRoute[]; required: boolean };

/** Route applicability and required-ness per question (spec §3, tables A–I). */
export const QUESTION_META: Record<QuestionId, QuestionMeta> = {
  advice_goal: { routes: ALL_ROUTES, required: true },
  route_self_select: { routes: ALL_ROUTES, required: true },
  age_band: { routes: ALL_ROUTES, required: true },
  experience_seasons: { routes: ALL_ROUTES, required: true },
  height_cm: { routes: ALL_ROUTES, required: true },
  height_uncertain: { routes: ALL_ROUTES, required: false },
  current_length_inch: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: false },
  junior_grip_needed: { routes: ['START', 'ONTWIKKEL'], required: false },
  first_touch_confidence: {
    routes: ['ONTWIKKEL', 'PRESTATIE'],
    required: true,
  },
  core_skills_stage: { routes: ['START', 'ONTWIKKEL'], required: true },
  playing_level: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: false },
  training_frequency: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: false },
  // The START flow is capped at six screens (spec §4.1) and uses fun_style
  // as its goal proxy, so primary_goals is only asked from ONTWIKKEL up.
  primary_goals: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: true },
  fun_style: { routes: ['START', 'ONTWIKKEL'], required: true },
  positions: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: false },
  match_actions_frequency: { routes: ['PRESTATIE'], required: true },
  skill_flat_pass: { routes: ['PRESTATIE'], required: true },
  skill_hit: { routes: ['PRESTATIE'], required: true },
  skill_dribble_3d: { routes: ['PRESTATIE'], required: true },
  skill_aerial: { routes: ['PRESTATIE'], required: true },
  skill_backhand: { routes: ['PRESTATIE'], required: true },
  skill_dragflick: { routes: ['PRESTATIE'], required: true },
  feel_preference: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: true },
  stick_weight_preference: { routes: ['PRESTATIE'], required: false },
  bow_experience: { routes: ['PRESTATIE'], required: false },
  vibration_sensitivity: { routes: ['PRESTATIE'], required: false },
  has_current_stick: { routes: ALL_ROUTES, required: true },
  current_stick_like: { routes: ['ONTWIKKEL', 'PRESTATIE'], required: false },
  current_stick_problem: { routes: ALL_ROUTES, required: false },
  replacement_reason: { routes: ALL_ROUTES, required: true },
  budget_band: { routes: ALL_ROUTES, required: true },
  purchase_timing: { routes: ALL_ROUTES, required: false },
  availability_preference: { routes: ALL_ROUTES, required: false },
  left_handed_requirement: { routes: ALL_ROUTES, required: true },
};

export const QUESTION_IDS = Object.keys(QUESTION_META) as QuestionId[];

export function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

const ROUTE_BY_SELF_SELECT: Record<
  z.infer<typeof routeSelfSelectSchema>,
  AdviceRoute
> = {
  first_stick: 'START',
  next_stick: 'ONTWIKKEL',
  advanced_compare: 'PRESTATIE',
};

/** The user's own choice always decides the route (spec §2.1). */
export function routeFromSelfSelect(
  value: AdviceAnswers['route_self_select'],
): AdviceRoute {
  return ROUTE_BY_SELF_SELECT[value];
}

export function requiredQuestionIds(route: AdviceRoute): QuestionId[] {
  return QUESTION_IDS.filter(
    (id) =>
      QUESTION_META[id].required && QUESTION_META[id].routes.includes(route),
  );
}

export const adviceAnswersSchema = baseAnswersSchema.superRefine(
  (data, ctx) => {
    const route = routeFromSelfSelect(data.route_self_select);
    for (const id of requiredQuestionIds(route)) {
      if (!isAnswered(data[id])) {
        ctx.addIssue({
          code: 'custom',
          message: 'Deze vraag is verplicht.',
          path: [id],
        });
      }
    }
  },
);
