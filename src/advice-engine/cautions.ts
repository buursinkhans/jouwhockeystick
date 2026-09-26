import type { Product } from '@/catalog/types';
import type { CautionCode, QuizProfile } from './types';

/** Nuanced, Dutch explanations — never an absolute warning, always "kan" (source-policy.md §4). */
export const CAUTION_LABELS: Record<CautionCode, string> = {
  HIGH_CARBON_FOR_BEGINNER:
    'Dit is een stick met een hoog carbonpercentage. Dat kan minder vergevingsgezind aanvoelen bij mishits, wat lastiger kan zijn als je nog weinig stickervaring hebt.',
  HIGH_CARBON_FOR_YOUNG_PLAYER:
    'Het hoge carbonpercentage van deze stick maakt hem stugger. Voor een jonge speler kan een lager carbonpercentage prettiger en veiliger aanvoelen.',
  EXPERIENCE_GAP:
    'Deze stick is doorgaans gericht op ervaren spelers. Dat kan een grotere stap zijn dan je op basis van je huidige ervaring zoekt.',
};

const HIGH_CARBON_THRESHOLD = 50;
const YOUNG_PLAYER_CARBON_THRESHOLD = 40;
const YOUNG_PLAYER_MAX_AGE = 11;

/**
 * Informational only — cautions never affect the score, so they can never
 * silently push a product down the ranking. They exist purely to disclose
 * a reason the top match might not be right for you (CLAUDE.md: geen
 * schijnprecisie, toon nuance).
 */
export function getCautions(product: Product, profile: QuizProfile): CautionCode[] {
  const cautions: CautionCode[] = [];
  const carbon = product.carbonPercentage.value;

  if (carbon >= HIGH_CARBON_THRESHOLD && profile.currentStickExperience === 'nog-geen-stick') {
    cautions.push('HIGH_CARBON_FOR_BEGINNER');
  }

  if (
    carbon >= YOUNG_PLAYER_CARBON_THRESHOLD &&
    profile.age !== null &&
    profile.age <= YOUNG_PLAYER_MAX_AGE
  ) {
    cautions.push('HIGH_CARBON_FOR_YOUNG_PLAYER');
  }

  if (product.experienceLevel.value === 'ervaren' && profile.experienceLevel === 'beginner') {
    cautions.push('EXPERIENCE_GAP');
  }

  return cautions;
}
