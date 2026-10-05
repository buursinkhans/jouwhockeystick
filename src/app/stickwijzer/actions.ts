'use server';

import { getAllProducts } from '@/catalog';
import { adviceAnswersSchema } from '@/advice-engine/answers';
import { getAdvice } from '@/advice-engine/engine';
import type { AdviceResult } from '@/advice-engine/types';

export type GetAdviceActionResult =
  | { status: 'success'; advice: AdviceResult }
  | { status: 'error'; message: string; invalidQuestionIds: string[] };

const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

/**
 * Runs the advice engine server-side so catalog data and rule logic never
 * ship to the client bundle. Answers are validated again here; the client
 * check is only for fast feedback.
 */
export async function getAdviceAction(
  input: unknown,
  adviceSessionId: string,
): Promise<GetAdviceActionResult> {
  const parsed = adviceAnswersSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'error',
      message:
        'Niet alle verplichte vragen zijn geldig ingevuld. Controleer je antwoorden.',
      invalidQuestionIds: parsed.error.issues.map((issue) =>
        String(issue.path[0]),
      ),
    };
  }

  const advice = getAdvice(parsed.data, getAllProducts(), {
    adviceSessionId: SESSION_ID_PATTERN.test(adviceSessionId)
      ? adviceSessionId
      : '',
  });

  return { status: 'success', advice };
}
