import { SCREENS } from './questions';

/**
 * "5 tot 7 stappen": the length of the shortest and the longest route, for
 * the first screen (no route chosen yet) and the homepage.
 */
export function routeStepRange(): string {
  const counts = Object.values(SCREENS).map((screens) => screens.length);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return min === max ? `${min} stappen` : `${min} tot ${max} stappen`;
}

/**
 * "Nog ongeveer … " next to the step counter, so a visitor sees the end of
 * the stickwijzer coming (2026-10-22). Counts the required questions that are
 * still to come, at roughly ten seconds each.
 */
const SECONDS_PER_QUESTION = 10;

export function remainingTimeText(
  questionsLeft: number,
  isLastStep: boolean,
): string {
  if (isLastStep) return 'laatste stap';
  const minutes = Math.max(
    1,
    Math.round((questionsLeft * SECONDS_PER_QUESTION) / 60),
  );
  return `nog ongeveer ${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
}
