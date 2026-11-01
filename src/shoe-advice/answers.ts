import { z } from 'zod';

/**
 * The shoe advice answers (docs/spec/hockeyschoenen-keuzemodel.md §5): the
 * eight main questions with their follow-ups, plus the shoe size. Question 7
 * (fit particulars: insoles or a brace, pain or injury, blisters) is not in
 * here on purpose: it never leaves the browser (fitNotes.ts, decision log
 * 2026-11-01). Separate from the stick answers (src/advice-engine/answers.ts).
 */

export const PURPOSES = ['veld', 'zaal', 'beide'] as const;
export const PLAYERS = ['kind', 'jeugd', 'volwassene', 'keeper'] as const;
export const SURFACES = ['bijna-alleen-water', 'vooral-water', 'gemengd', 'vooral-zand-semi', 'weet-niet'] as const;
export const SECOND_SURFACES = ['water', 'zand', 'semi-water', 'geen'] as const;
export const FREQUENCIES = ['1x', '2-3x', '4x-plus'] as const;
export const SESSIONS = ['kort', 'lang'] as const;
export const FIT_ISSUES = ['goed', 'krap-voorvoet', 'ruim-hiel', 'druk-wreef', 'schuiven', 'weet-niet'] as const;
export const MOVEMENTS = ['sprints', 'zijwaarts', 'loopmeters', 'allround', 'beginner'] as const;
export const POSITIONS = ['aanval', 'middenveld', 'verdediging', 'wisselend'] as const;
export const BUDGETS = ['tot-50', '50-80', '80-110', '110-plus', 'geen'] as const;
export const PREFERENCES = ['comfort', 'stevig', 'licht', 'slijtvast', 'vocht', 'geen'] as const;

/** Upper bound per budget answer, in euros (feed price of one pair); null = no limit. */
export const BUDGET_MAX: Record<(typeof BUDGETS)[number], number | null> = {
  'tot-50': 50,
  '50-80': 80,
  '80-110': 110,
  '110-plus': null,
  geen: null,
};

const atMostTwo = <T extends z.ZodTypeAny>(item: T) => z.array(item).min(1).max(2);

export const shoeAnswersSchema = z
  .object({
    /** Q1. "beide" gives two separate advices, never one compromise pair. */
    purpose: z.enum(PURPOSES),
    /** Q2. A keeper gets a separate boundary, no field-player advice. */
    player: z.enum(PLAYERS),
    /** Q3, field only. */
    surface: z.enum(SURFACES).optional(),
    /** Q3 follow-up: the second surface used regularly. */
    secondSurface: z.enum(SECOND_SURFACES).optional(),
    /** Q4 and its optional follow-up. */
    frequency: z.enum(FREQUENCIES).optional(),
    session: z.enum(SESSIONS).optional(),
    /** Q5: forefoot, heel and instep stay separate; several at once. */
    fitIssues: z.array(z.enum(FIT_ISSUES)).min(1).max(FIT_ISSUES.length).optional(),
    /** Q6: at most two; the position is optional context only. */
    movements: atMostTwo(z.enum(MOVEMENTS)).optional(),
    position: z.enum(POSITIONS).optional(),
    /** Q8: budget apart, permission for a dearer alternative, at most two preferences. */
    budget: z.enum(BUDGETS).optional(),
    allowAboveBudget: z.boolean().optional(),
    preferences: atMostTwo(z.enum(PREFERENCES)).optional(),
    /** Shoe size (EU) as the shops write it, or null for "maat nog bepalen". */
    size: z.string().max(12).nullable().optional(),
  })
  .strict()
  .superRefine((answers, ctx) => {
    if (answers.player === 'keeper') return;
    const required = ['frequency', 'fitIssues', 'movements', 'budget', 'preferences'] as const;
    for (const key of required) {
      if (answers[key] === undefined) ctx.addIssue({ code: 'custom', path: [key], message: 'Verplicht' });
    }
    if (answers.purpose !== 'zaal' && answers.surface === undefined) {
      ctx.addIssue({ code: 'custom', path: ['surface'], message: 'Verplicht bij veldhockey' });
    }
    if (answers.purpose === 'zaal' && (answers.surface !== undefined || answers.secondSurface !== undefined)) {
      ctx.addIssue({ code: 'custom', path: ['surface'], message: 'Alleen bij veldhockey' });
    }
  });

export type ShoeAnswers = z.infer<typeof shoeAnswersSchema>;
export type FitIssue = (typeof FIT_ISSUES)[number];
