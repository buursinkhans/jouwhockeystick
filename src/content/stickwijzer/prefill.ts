import type { AdviceAnswers } from '@/advice-engine/answers';

/**
 * Answers a link may fill in before the stickwijzer opens (2026-11-13):
 * `?snel` chooses the quick advice (the homepage link for parents), `voor=kind`
 * answers "voor wie" with a child (the gift article). Nothing else, and never
 * anything personal: a link can only pick one of the existing answer options.
 */
export function answersFromSearch(search: string): Partial<AdviceAnswers> {
  const params = new URLSearchParams(search);
  const answers: Partial<AdviceAnswers> = {};
  if (params.has('snel')) answers.route_self_select = 'quick';
  if (params.get('voor') === 'kind') answers.advice_goal = 'child';
  return answers;
}
