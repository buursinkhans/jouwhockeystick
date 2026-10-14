import {
  routeFromSelfSelect,
  type AdviceAnswers,
  type AdviceRoute,
  type Goal,
} from './answers';
import { getSizeAdvice } from './sizeAdvice';
import type {
  ExperienceBand,
  LevelBasis,
  PlayerContext,
  StickFeel,
  WeightedGoal,
} from './types';

const BAND_ORDER: readonly ExperienceBand[] = [
  'starter',
  'developing',
  'advanced',
];

/** Up to and including 15: the age band sets the starting level. */
const JUNIOR_AGE_BANDS: ReadonlyArray<AdviceAnswers['age_band']> = [
  'under_8',
  '8_10',
  '11_12',
  '13_15',
];
/** Under 11: starts as a beginner and gets a soft stick by default. */
const YOUNG_AGE_BANDS: ReadonlyArray<AdviceAnswers['age_band']> = [
  'under_8',
  '8_10',
];
const FIRST_SEASON: ReadonlyArray<AdviceAnswers['experience_seasons']> = [
  'trial',
  'lt_1',
];
const PERFORMANCE_LEVELS: ReadonlyArray<
  NonNullable<AdviceAnswers['playing_level']>
> = ['selection', 'senior_competitive', 'top'];
const CONFIDENT_FIRST_TOUCH: ReadonlyArray<
  NonNullable<AdviceAnswers['first_touch_confidence']>
> = ['good_under_pressure', 'very_confident'];

/**
 * A clear sign the player performs above the age-based starting level: the
 * performance route, a selection/competitive/top team, or 4+ seasons with a
 * confident first touch.
 */
export function hasPerformanceSignal(
  answers: AdviceAnswers,
  route: AdviceRoute,
): boolean {
  return (
    route === 'PRESTATIE' ||
    (answers.playing_level !== undefined &&
      PERFORMANCE_LEVELS.includes(answers.playing_level)) ||
    (answers.experience_seasons === '4_plus' &&
      answers.first_touch_confidence !== undefined &&
      CONFIDENT_FIRST_TOUCH.includes(answers.first_touch_confidence))
  );
}

/**
 * Owner's rule (2026-10-14): the player's level comes from the answers, not
 * from the route, which only decides how many questions are asked.
 * - Less than one season: beginner.
 * - Juniors (up to 15): the age sets the starting level, under 11 beginner,
 *   11–15 developing.
 * - From 16: developing (one season or more).
 * - A performance signal adds one level, unless the basics are still being
 *   learned.
 */
export function derivePlayerBand(
  answers: AdviceAnswers,
  route: AdviceRoute,
): { band: ExperienceBand; basis: LevelBasis } {
  if (FIRST_SEASON.includes(answers.experience_seasons)) {
    return {
      band: 'starter',
      basis: { base: 'first_season', steppedUp: false },
    };
  }
  const junior = JUNIOR_AGE_BANDS.includes(answers.age_band);
  const base: ExperienceBand = YOUNG_AGE_BANDS.includes(answers.age_band)
    ? 'starter'
    : 'developing';
  const stillLearning =
    answers.first_touch_confidence === 'learning' ||
    answers.core_skills_stage === 'practicing_basics';
  const steppedUp = hasPerformanceSignal(answers, route) && !stillLearning;
  const band = steppedUp
    ? (BAND_ORDER[BAND_ORDER.indexOf(base) + 1] ?? base)
    : base;
  return { band, basis: { base: junior ? 'age' : 'seasons', steppedUp } };
}

const GOAL_BY_FUN_STYLE: Record<
  NonNullable<AdviceAnswers['fun_style']>,
  Goal
> = {
  build_pass: 'passing',
  join_everywhere: 'allround',
  dribble_actions: 'dribble_3d',
  finishing: 'hit',
  defend_intercept: 'first_touch',
};

const GOAL_BY_MATCH_ACTION: Record<
  NonNullable<AdviceAnswers['match_actions_frequency']>[number],
  Goal
> = {
  hard_flats: 'passing',
  tempo_passes: 'passing',
  hit: 'hit',
  backhand: 'backhand',
  three_d: 'dribble_3d',
  lift: 'dribble_3d',
  aerial: 'aerial',
  dragflick: 'dragflick',
};

export const BUDGET_RANGE: Record<
  AdviceAnswers['budget_band'],
  { minEur: number; maxEur: number } | null
> = {
  lt_75: { minEur: 0, maxEur: 75 },
  '75_125': { minEur: 75, maxEur: 125 },
  '125_175': { minEur: 125, maxEur: 175 },
  '175_250': { minEur: 175, maxEur: 250 },
  gt_250: { minEur: 250, maxEur: Number.POSITIVE_INFINITY },
  compare_first: null,
};

/**
 * Stated goals are the main driver; play-style and match-action answers
 * count for half, so a single goal answer is never drowned out by them.
 */
function collectGoals(
  answers: AdviceAnswers,
  route: AdviceRoute,
): WeightedGoal[] {
  const weights = new Map<Goal, number>();
  const add = (goal: Goal, weight: number) =>
    weights.set(goal, (weights.get(goal) ?? 0) + weight);

  for (const goal of answers.primary_goals ?? []) {
    add(goal, 1);
  }
  if (answers.fun_style && route !== 'PRESTATIE') {
    add(GOAL_BY_FUN_STYLE[answers.fun_style], route === 'START' ? 1 : 0.5);
  }
  if (route === 'PRESTATIE') {
    for (const action of answers.match_actions_frequency ?? []) {
      add(GOAL_BY_MATCH_ACTION[action], 0.5);
    }
    if (
      answers.skill_aerial === 'regular' ||
      answers.skill_aerial === 'key_weapon'
    ) {
      add('aerial', 0.5);
    }
    if (answers.skill_backhand === 'very_important') {
      add('backhand', 0.5);
    }
    if (answers.skill_dragflick === 'specialist') {
      add('dragflick', 1);
    } else if (answers.skill_dragflick === 'sometimes') {
      add('dragflick', 0.5);
    }
  }

  return Array.from(weights, ([goal, weight]) => ({ goal, weight }));
}

function resolveFeelPreference(
  answers: AdviceAnswers,
  route: AdviceRoute,
): StickFeel | null {
  if (route === 'START') {
    return 'soft';
  }
  if (answers.feel_preference && answers.feel_preference !== 'unknown') {
    return answers.feel_preference;
  }
  // No stated preference: a complaint about the current stick is the next best signal.
  const problems = answers.current_stick_problem ?? [];
  if (problems.includes('too_hard') || problems.includes('hard_to_receive')) {
    return 'soft';
  }
  if (problems.includes('too_soft') || problems.includes('little_power')) {
    return 'direct';
  }
  // Young players without a preference: soft, unless they clearly perform above their age.
  if (
    YOUNG_AGE_BANDS.includes(answers.age_band) &&
    !hasPerformanceSignal(answers, route)
  ) {
    return 'soft';
  }
  return null;
}

export function buildPlayerContext(
  answers: AdviceAnswers,
  now: Date = new Date(),
): PlayerContext {
  const route = routeFromSelfSelect(answers.route_self_select);
  const currentLength =
    answers.current_length_inch && answers.current_length_inch !== 'unknown'
      ? Number(answers.current_length_inch)
      : undefined;

  const firstTouch = answers.first_touch_confidence;
  const hasDragflickRole =
    route === 'PRESTATIE'
      ? answers.skill_dragflick !== undefined &&
        answers.skill_dragflick !== 'none'
      : (answers.primary_goals ?? []).includes('dragflick');

  const level = derivePlayerBand(answers, route);

  return {
    answers,
    route,
    band: level.band,
    levelBasis: level.basis,
    sizeAdvice: getSizeAdvice(answers.height_cm, {
      heightUncertain: answers.height_uncertain === 'yes',
      currentLengthInch: currentLength,
    }),
    goals: collectGoals(answers, route),
    learningControl:
      route === 'START' ||
      firstTouch === 'learning' ||
      answers.core_skills_stage === 'practicing_basics',
    firstTouchLow: firstTouch === 'learning' || firstTouch === 'mostly_good',
    feelPreference: resolveFeelPreference(answers, route),
    hasDragflickRole,
    budget: BUDGET_RANGE[answers.budget_band],
    preferredBrand:
      answers.has_current_stick === 'yes' &&
      answers.brand_loyalty === 'same_brand' &&
      answers.current_stick_brand !== undefined &&
      answers.current_stick_brand !== 'other' &&
      answers.current_stick_brand !== 'unknown'
        ? answers.current_stick_brand
        : null,
    now,
  };
}
