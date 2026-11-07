import type { AdviceAnswers } from './answers';

/**
 * Fixed, FICTIONAL player profiles for the stickwijzer comparison bench
 * (scripts/stickwijzer-bench.ts, decision log 2026-11-08). Not real people
 * and never shown on the site: they exist to compare rule versions on the
 * same answers and the same catalog. Pairs that differ in one answer test the
 * invariants: a higher budget, the route, the team level or a brand
 * preference may not change the advice in the wrong direction.
 */
export type BenchProfile = { id: string; label: string; answers: AdviceAnswers };

const child: AdviceAnswers = {
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
};

const adultBeginner: AdviceAnswers = {
  ...child,
  advice_goal: 'self',
  age_band: '18_plus',
  height_cm: 178,
};

const youth: AdviceAnswers = {
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
  current_stick_brand: 'unknown',
  replacement_reason: 'next_step',
  budget_band: '125_175',
};

const competitive: AdviceAnswers = {
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
  current_stick_brand: 'unknown',
  replacement_reason: 'next_step',
  budget_band: '175_250',
};

export const BENCH_PROFILES: readonly BenchProfile[] = [
  { id: 'kind-eerste', label: 'Eerste stick, kind 8–10, budget €75–125', answers: child },
  { id: 'kind-eerste-ruim', label: 'Zelfde kind, budget boven €250', answers: { ...child, budget_band: 'gt_250' } },
  { id: 'volw-eerste', label: 'Eerste stick, volwassene, budget €75–125', answers: adultBeginner },
  { id: 'volw-eerste-ruim', label: 'Zelfde volwassene, budget boven €250', answers: { ...adultBeginner, budget_band: 'gt_250' } },
  { id: 'jeugd', label: 'Jeugd 13–15, 2–3 seizoenen, route ontwikkel', answers: youth },
  { id: 'jeugd-prestatie', label: 'Zelfde jeugd, route prestatie gekozen', answers: { ...youth, route_self_select: 'advanced_compare' } },
  { id: 'jeugd-selectie', label: 'Zelfde jeugd, speelt in een selectieteam', answers: { ...youth, playing_level: 'selection' } },
  { id: 'jeugd-ruim', label: 'Zelfde jeugd, budget €175–250', answers: { ...youth, budget_band: '175_250' } },
  { id: 'jeugd-uitgegroeid', label: 'Jeugd uitgegroeid, huidige stick te kort', answers: { ...youth, replacement_reason: 'outgrown', current_stick_problem: ['too_short'] } },
  { id: 'competitie', label: 'Competitiespeler 16–18, 4+ seizoenen', answers: competitive },
  { id: 'competitie-merk-krap', label: 'Competitiespeler, alleen Ritual, budget onder €75', answers: { ...competitive, current_stick_brand: 'Ritual', brand_loyalty: 'same_brand', budget_band: 'lt_75' } },
  { id: 'competitie-merk', label: 'Competitiespeler, liefst Brabo, budget €175–250', answers: { ...competitive, current_stick_brand: 'Brabo', brand_loyalty: 'same_brand' } },
  { id: 'beginner-specialist', label: 'Beginner volwassene wil slepen (dragflick)', answers: { ...adultBeginner, primary_goals: ['dragflick'] } },
];
