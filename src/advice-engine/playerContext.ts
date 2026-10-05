import {
  routeFromSelfSelect,
  type AdviceAnswers,
  type AdviceRoute,
  type Goal,
} from './answers';
import { getSizeAdvice } from './sizeAdvice';
import type {
  ExperienceBand,
  PlayerContext,
  StickFeel,
  WeightedGoal,
} from './types';

const BAND_BY_ROUTE: Record<AdviceRoute, ExperienceBand> = {
  START: 'starter',
  ONTWIKKEL: 'developing',
  PRESTATIE: 'advanced',
};

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

  return {
    answers,
    route,
    band: BAND_BY_ROUTE[route],
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
    now,
  };
}
