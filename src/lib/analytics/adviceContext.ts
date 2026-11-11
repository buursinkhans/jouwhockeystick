import { createContext, useContext } from 'react';
import type { AdviceRoute } from '@/advice-engine/answers';
import type { ResultRole } from '@/advice-engine/types';

/**
 * What a shop click inside a stickwijzer advice adds to `retailer_click`
 * (2026-11-11): which advised stick was clicked, as which role and in which
 * place, plus three answers that are already counted anonymously in
 * `question_answered` (privacy statement, "Statistieken"). No height, no age,
 * no free text. A click outside an advice has none of these fields.
 */
export type AdviceClickContext = {
  /** The system's own role key of the card, e.g. 'best_match' ("Onze keuze"), 'safe_choice', 'ambitious_choice'. */
  adviceRole: ResultRole;
  /** Place in the advice as shown (1 = top). */
  adviceRank: number;
  adviceRoute: AdviceRoute;
  budgetBand?: string;
  replacementReason?: string;
};

/** The answers that go with every click of one advice (absent in a shared advice: its answers are not ours to measure). */
export type AdviceClickAnswers = { budgetBand?: string; replacementReason?: string };

export function adviceClickContext(
  item: { role: ResultRole },
  rank: number,
  route: AdviceRoute,
  answers: AdviceClickAnswers = {},
): AdviceClickContext {
  return {
    adviceRole: item.role,
    adviceRank: rank,
    adviceRoute: route,
    ...(answers.budgetBand && { budgetBand: answers.budgetBand }),
    ...(answers.replacementReason && { replacementReason: answers.replacementReason }),
  };
}

export const AdviceClick = createContext<AdviceClickContext | null>(null);

/** The context of the advice card a shop link sits in, or null elsewhere. */
export const useAdviceClick = (): AdviceClickContext | null => useContext(AdviceClick);
