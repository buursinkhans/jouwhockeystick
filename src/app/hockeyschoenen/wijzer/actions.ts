'use server';

import { shoeAnswersSchema } from '@/shoe-advice/answers';
import { shoeAdviceCatalog } from '@/shoe-advice/catalog';
import { getShoeAdvice } from '@/shoe-advice/engine';
import type { ShoeAdvice } from '@/shoe-advice/types';

export type GetShoeAdviceResult =
  | { status: 'success'; advice: ShoeAdvice }
  | { status: 'error'; message: string; invalidQuestionIds: string[] };

/**
 * Runs the shoe advice rules server-side, like the stickwijzer. The answers
 * are validated again here. Question 7 is never sent (the schema rejects it)
 * and nothing is stored or logged.
 */
export async function getShoeAdviceAction(input: unknown): Promise<GetShoeAdviceResult> {
  const parsed = shoeAnswersSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Niet alle vragen zijn geldig ingevuld. Controleer je antwoorden.',
      invalidQuestionIds: parsed.error.issues.map((issue) => String(issue.path[0])),
    };
  }
  return { status: 'success', advice: getShoeAdvice(parsed.data, shoeAdviceCatalog()) };
}
