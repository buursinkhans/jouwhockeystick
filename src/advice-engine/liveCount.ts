import { getDiscipline } from '@/catalog';
import type { Product } from '@/catalog/types';
import type { AdviceAnswers } from './answers';
import { BUDGET_RANGE, derivePlayerBand } from './playerContext';
import { BAND_ORDER, deriveAdviceRules, getAdviceBlockers } from './productRules';
import { getSizeAdvice, matchSize } from './sizeAdvice';

/**
 * "Nog X veldsticks passen" while the stickwijzer is being filled in (UX
 * phase 2, 2026-11-08). Counts the field sticks that pass the checks the
 * answers so far allow, with the engine's own rules: the advice data, the
 * size from the height, the budget maximum and a level that is not too
 * high. Null until there is something to check. The final advice can show
 * fewer, because it also checks safety and the route; never more.
 */
export function countFittingSticks(answers: Partial<AdviceAnswers>, products: readonly Product[], now: Date): number | null {
  const size = answers.height_cm ? getSizeAdvice(answers.height_cm, { heightUncertain: answers.height_uncertain === 'yes' }) : null;
  const budget = answers.budget_band ? BUDGET_RANGE[answers.budget_band] : null;
  const band =
    answers.age_band && answers.experience_seasons
      ? derivePlayerBand(answers as AdviceAnswers).band
      : null;
  if (!size && !answers.budget_band && !band) return null;
  return products.filter(
    (product) =>
      getDiscipline(product) === 'veld' &&
      getAdviceBlockers(product, now).length === 0 &&
      (!size || matchSize(product, size) !== 'none') &&
      (!budget || product.priceIndicativeEur.value <= budget.maxEur) &&
      (!band || BAND_ORDER.indexOf(band) >= BAND_ORDER.indexOf(deriveAdviceRules(product).minBand)),
  ).length;
}
