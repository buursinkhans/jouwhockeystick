'use server';

import { getAllProducts } from '@/catalog';
import { getAdvice } from '@/advice-engine/engine';
import { normalizeProfile } from '@/advice-engine/normalizeProfile';
import { quizAnswersSchema, type QuizAnswers, type AdviceResult } from '@/advice-engine/types';

export type GetAdviceActionResult =
  | { status: 'success'; advice: AdviceResult }
  | { status: 'error'; message: string };

/**
 * Runs the advice engine server-side so catalog data and rule logic never
 * ship to the client bundle.
 */
export async function getAdviceAction(input: QuizAnswers): Promise<GetAdviceActionResult> {
  const parsed = quizAnswersSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: 'Niet alle antwoorden zijn geldig ingevuld.' };
  }

  const profile = normalizeProfile(parsed.data);
  const advice = getAdvice(profile, getAllProducts());

  return { status: 'success', advice };
}
