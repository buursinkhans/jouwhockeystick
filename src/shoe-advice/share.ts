import { visibleQuestions, type ShoeQuizState } from '@/content/schoenenwijzer/questions';
import type { ShoeAnswers } from './answers';

/** Where a shared shoe advice opens (noindex); the link holds the answers. */
export const SHOE_SHARE_PATH = '/hockeyschoenen/wijzer/advies';

/**
 * The answers that leave the browser (to the server and into a share link):
 * only the questions that were shown, and never question 7, the fit
 * particulars (decision log 2026-11-01).
 */
export function toServerAnswers(state: ShoeQuizState): Partial<ShoeAnswers> {
  const visible = new Set(visibleQuestions(state).map((q) => q.id));
  const answers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (key === 'fitParticulars' || !visible.has(key as keyof ShoeQuizState) || value === undefined) continue;
    answers[key] = value;
  }
  return answers as Partial<ShoeAnswers>;
}
