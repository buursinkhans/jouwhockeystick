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
