import type { Product } from '@/catalog/types';
import type { AdviceAnswers } from './answers';
import { BOW_RANK, deriveAdviceRules } from './productRules';
import type { CautionCode, PlayerContext, ResultRole } from './types';

const HIGH_CARBON_CAUTION_THRESHOLD = 50;

const BOW_EXPERIENCE_RANK: Record<
  Exclude<NonNullable<AdviceAnswers['bow_experience']>, 'unknown'>,
  number
> = { standard: 0.5, pro_late: 2, low: 3, extreme_low: 4 };

/**
 * Informational only — cautions never affect the score, so they can never
 * silently push a product down the ranking. They disclose the trade-off the
 * player makes with this stick (spec §1.2, §6.4).
 */
export function getCautions(product: Product, ctx: PlayerContext, role: ResultRole): CautionCode[] {
  const cautions: CautionCode[] = [];
  const rules = deriveAdviceRules(product);
  const carbon = product.carbonPercentage?.value;
  const bow = product.bowProfile?.value;

  if (role === 'other_size') {
    cautions.push('OTHER_SIZE');
  }
  if (role === 'ambitious_choice') {
    cautions.push('AMBITIOUS_STEP');
  }
  if (
    carbon !== undefined &&
    carbon >= HIGH_CARBON_CAUTION_THRESHOLD &&
    (ctx.band !== 'advanced' || ctx.firstTouchLow)
  ) {
    cautions.push('HIGH_CARBON_STEP');
  }
  if (
    (bow === 'lowbow' || bow === 'extreme_lowbow') &&
    (ctx.route !== 'PRESTATIE' || ctx.answers.first_touch_confidence !== 'very_confident')
  ) {
    cautions.push('LOWBOW_TRADEOFF');
  }

  const bowExperience = ctx.answers.bow_experience;
  if (
    bow &&
    bowExperience &&
    bowExperience !== 'unknown' &&
    Math.abs(BOW_EXPERIENCE_RANK[bowExperience] - BOW_RANK[bow]) >= 2
  ) {
    cautions.push('BIG_BOW_CHANGE');
  }
  if (
    rules.feel === 'direct' &&
    (ctx.answers.vibration_sensitivity === 'yes' || ctx.answers.vibration_sensitivity === 'sometimes')
  ) {
    cautions.push('DIRECT_FEEL_VIBRATION');
  }
  if (rules.feel === 'soft') {
    cautions.push('LESS_POWER');
  }
  if (carbon === undefined) {
    cautions.push('CARBON_UNKNOWN');
  }

  return cautions;
}
