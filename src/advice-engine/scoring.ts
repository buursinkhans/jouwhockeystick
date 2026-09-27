import type { Product } from '@/catalog/types';
import { getCautions } from './cautions';
import type { QuizProfile, ReasonCode, ScoredProduct } from './types';

/**
 * Points per criterion. Position weight is deliberately capped well below
 * 15% of the maximum score, so position can never be the sole deciding
 * factor (CLAUDE.md — Adviesengine).
 */
const POINTS = {
  experienceMatch: 25,
  playstyleMatch: 25,
  comfortMatch: 20,
  budgetHeadroom: 15,
  positionAlignment: 10,
  upgradePath: 10,
  stockAvailable: 5,
} as const;

/**
 * `verified: true` means we have actual evidence for the comfort match, so
 * it's safe to show the COMFORT_MATCH reason to the user. An unknown carbon
 * percentage (some brands, e.g. Grays, don't publish one) gets the same
 * neutral score as "no preference" — never treated as a confirmed mismatch
 * — so a brand's incomplete public specs don't structurally push it down
 * the ranking. It just never gets to claim credit it can't back up.
 */
function scoreComfort(product: Product, profile: QuizProfile): { score: number; verified: boolean } {
  const carbon = product.carbonPercentage?.value;
  if (carbon === undefined) {
    return { score: POINTS.comfortMatch / 2, verified: false };
  }
  if (profile.comfortPreference === 'geen-voorkeur') {
    return { score: POINTS.comfortMatch / 2, verified: true };
  }
  if (profile.comfortPreference === 'licht-wendbaar' && carbon <= 20) {
    return { score: POINTS.comfortMatch, verified: true };
  }
  if (profile.comfortPreference === 'stevig-krachtig' && carbon >= 40) {
    return { score: POINTS.comfortMatch, verified: true };
  }
  return { score: 0, verified: false };
}

function scoreUpgradePath(product: Product, profile: QuizProfile): number {
  if (
    profile.currentStickExperience === 'ruime-ervaring' &&
    (product.experienceLevel.value === 'gevorderd' || product.experienceLevel.value === 'ervaren')
  ) {
    return POINTS.upgradePath;
  }
  if (profile.currentStickExperience === 'basis' && product.experienceLevel.value === 'gevorderd') {
    return POINTS.upgradePath / 2;
  }
  return 0;
}

export function scoreProduct(product: Product, profile: QuizProfile): ScoredProduct {
  const reasonCodes: ReasonCode[] = [];
  let score = 0;

  if (product.experienceLevel.value === profile.experienceLevel) {
    score += POINTS.experienceMatch;
    reasonCodes.push('EXPERIENCE_MATCH');
  }

  if (profile.preferredBowProfile && product.bowProfile?.value === profile.preferredBowProfile) {
    score += POINTS.playstyleMatch;
    reasonCodes.push('PLAYSTYLE_MATCH');
  }

  const comfort = scoreComfort(product, profile);
  score += comfort.score;
  if (comfort.verified) {
    reasonCodes.push('COMFORT_MATCH');
  }

  if (product.priceIndicativeEur.value <= profile.budgetMaxEur * 0.8) {
    score += POINTS.budgetHeadroom;
    reasonCodes.push('BUDGET_FIT');
  }

  if (product.recommendedPositions.value.includes(profile.position)) {
    score += POINTS.positionAlignment;
    reasonCodes.push('POSITION_ALIGNMENT');
  }

  const upgradeScore = scoreUpgradePath(product, profile);
  if (upgradeScore > 0) {
    score += upgradeScore;
    reasonCodes.push('UPGRADE_PATH');
  }

  if (product.stock.value === 'available') {
    score += POINTS.stockAvailable;
    reasonCodes.push('STOCK_AVAILABLE');
  }

  return { product, score, reasonCodes, cautions: getCautions(product, profile) };
}

export const MAX_POSSIBLE_SCORE = Object.values(POINTS).reduce((sum, value) => sum + value, 0);
