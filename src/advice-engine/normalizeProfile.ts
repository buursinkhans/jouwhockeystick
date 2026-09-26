import type { BowProfile } from '@/catalog/types';
import type { QuizAnswers, QuizProfile } from './types';

/**
 * Approximate, editorial height-to-stick-length fitting table (inches).
 * Not a medical or federation standard — used only to narrow the hard
 * length filter, never shown to the user as an absolute rule.
 */
const HEIGHT_TO_LENGTH_RANGE: Array<{ maxHeightCm: number; range: [number, number] }> = [
  { maxHeightCm: 120, range: [28, 30] },
  { maxHeightCm: 130, range: [30, 31] },
  { maxHeightCm: 140, range: [31, 32] },
  { maxHeightCm: 150, range: [32, 33] },
  { maxHeightCm: 160, range: [33, 34] },
  { maxHeightCm: 170, range: [34, 35] },
  { maxHeightCm: 180, range: [35, 36.5] },
  { maxHeightCm: 190, range: [36.5, 37.5] },
  { maxHeightCm: Number.POSITIVE_INFINITY, range: [37.5, 38.5] },
];

function lengthRangeForHeight(heightCm: number): [number, number] {
  const match = HEIGHT_TO_LENGTH_RANGE.find((entry) => heightCm <= entry.maxHeightCm);
  return match ? match.range : [35, 37.5];
}

function preferredBowProfileFor(answers: QuizAnswers): BowProfile | null {
  if (answers.desiredPlayActions.includes('shot')) {
    return 'late-bow';
  }
  if (answers.desiredPlayActions.includes('dribbelen') && answers.experienceLevel !== 'beginner') {
    return 'mid-bow';
  }
  if (answers.experienceLevel === 'beginner') {
    return 'low-bow';
  }
  return null;
}

export function normalizeProfile(answers: QuizAnswers): QuizProfile {
  return {
    buyerType: answers.buyerType,
    age: answers.age ?? null,
    lengthRangeInches: lengthRangeForHeight(answers.playerHeightCm),
    experienceLevel: answers.experienceLevel,
    currentStickExperience: answers.currentStickExperience,
    position: answers.position,
    desiredPlayActions: answers.desiredPlayActions,
    comfortPreference: answers.comfortPreference,
    preferredBowProfile: preferredBowProfileFor(answers),
    budgetMaxEur: answers.budgetMaxEur,
  };
}
