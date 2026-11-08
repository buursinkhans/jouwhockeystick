import { isAnswered, type AdviceAnswers, type QuestionId } from '@/advice-engine/answers';
import { QUESTIONS, type ScreenDef } from './questions';

/**
 * The next required question on this screen after `afterId` that is still
 * open, given the answers after this change (follow-up questions included);
 * undefined when the rest of the screen is done. Optional questions never
 * count: they stay folded until the visitor opens them.
 */
export function nextOpenQuestion(
  screen: ScreenDef,
  answers: Partial<AdviceAnswers>,
  afterId: QuestionId,
): QuestionId | undefined {
  const optional = new Set(screen.optional ?? []);
  const order = (screen.order ?? [...screen.questions, ...(screen.optional ?? [])]).filter(
    (id) => !optional.has(id) && (QUESTIONS[id].showWhen?.(answers) ?? true),
  );
  const start = order.indexOf(afterId);
  return order.slice(start + 1).find((id) => !isAnswered(answers[id]));
}
