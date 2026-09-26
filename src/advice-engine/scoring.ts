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

function scoreComfort(product: Product, profile: QuizProfile): number {
  const carbon = product.carbonPercentage.value;
  if (profile.comfortPreference === 'geen-voorkeur') {
    return POINTS.comfortMatch / 2;
  }
  if (profile.comfortPreference === 'licht-wendbaar' && carbon <= 20) {
    return POINTS.comfortMatch;
  }
  if (profile.comfortPreference === 'stevig-krachtig' && carbon >= 40) {
    return POINTS.comfortMatch;
  }
  return 0;
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

  if (profile.preferredBowProfile && product.bowProfile.value === profile.preferredBowProfile) {
    score += POINTS.playstyleMatch;
    reasonCodes.push('PLAYSTYLE_MATCH');
  }

  const comfortScore = scoreComfort(product, profile);
  if (comfortScore > 0) {
    score += comfortScore;
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
