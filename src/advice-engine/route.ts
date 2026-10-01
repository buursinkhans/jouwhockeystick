import type { AdviceAnswers, AdviceRoute } from './answers';

type RouteSignals = Pick<AdviceAnswers, 'age_band' | 'experience_seasons'> &
  Partial<Pick<AdviceAnswers, 'core_skills_stage'>>;

/**
 * The spec's rule is "leeftijd <= 11". Age is only asked as a band, and the
 * 11–12 band contains 11, so that band counts as young here. The user can
 * always override the suggestion.
 */
const YOUNG_AGE_BANDS: ReadonlyArray<AdviceAnswers['age_band']> = ['under_8', '8_10', '11_12'];
const UNDER_ONE_SEASON: ReadonlyArray<AdviceAnswers['experience_seasons']> = ['trial', 'lt_1'];
const UNDER_TWO_SEASONS: ReadonlyArray<AdviceAnswers['experience_seasons']> = ['trial', 'lt_1', '1'];

/**
 * Suggested route from age and experience (spec §2.1). Only a suggestion:
 * the route the user confirms in `route_self_select` is what the engine uses.
 */
export function suggestRoute(signals: RouteSignals): AdviceRoute {
  if (
    YOUNG_AGE_BANDS.includes(signals.age_band) &&
    UNDER_ONE_SEASON.includes(signals.experience_seasons)
  ) {
    return 'START';
  }
  if (
    UNDER_TWO_SEASONS.includes(signals.experience_seasons) ||
    signals.core_skills_stage === 'practicing_basics'
  ) {
    return 'ONTWIKKEL';
  }
  return 'PRESTATIE';
}
