'use server';

import { getAllProducts } from '@/catalog';
import {
  adviceAnswersSchema,
  ageBandSchema,
  budgetBandSchema,
  coreSkillsSchema,
  experienceSeasonsSchema,
  firstTouchSchema,
  type AdviceAnswers,
} from '@/advice-engine/answers';
import { countFittingSticks } from '@/advice-engine/liveCount';
import { z } from 'zod';
import { getAdvice } from '@/advice-engine/engine';
import type { AdviceResult } from '@/advice-engine/types';

export type GetAdviceActionResult =
  | { status: 'success'; advice: AdviceResult }
  | { status: 'error'; message: string; invalidQuestionIds: string[] };

/** The answers the live count reads; anything else is ignored. */
const countInputSchema = z
  .object({
    height_cm: z.number().int().min(95).max(210).optional(),
    height_uncertain: z.enum(['yes', 'no']).optional(),
    age_band: ageBandSchema.optional(),
    experience_seasons: experienceSeasonsSchema.optional(),
    first_touch_confidence: firstTouchSchema.optional(),
    core_skills_stage: coreSkillsSchema.optional(),
    budget_band: budgetBandSchema.optional(),
  })
  .transform((value) => value as Partial<AdviceAnswers>);

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

  const advice = getAdvice(parsed.data, getAllProducts(new Date(), { includeImported: true }), {
    adviceSessionId: SESSION_ID_PATTERN.test(adviceSessionId)
      ? adviceSessionId
      : '',
  });

  return { status: 'success', advice };
}

/**
 * The live count under the stickwijzer's progress (UX phase 2). Only the
 * answers it needs are read; nothing is stored or logged.
 */
export async function countFittingAction(input: unknown): Promise<number | null> {
  const parsed = countInputSchema.safeParse(input);
  if (!parsed.success) return null;
  const now = new Date();
  return countFittingSticks(parsed.data, getAllProducts(now, { includeImported: true }), now);
}
