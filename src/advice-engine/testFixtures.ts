import type { Product } from '@/catalog/types';
import type { QuizProfile } from './types';

export const NOW = new Date('2026-09-22T12:00:00.000Z');

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    slug: 'test-product',
    brand: 'Grays',
    name: 'Test Product',
    dataStatus: 'test-data',
    imageAlt: 'Test product',
    experienceLevel: {
      value: 'beginner',
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    recommendedPositions: {
      value: ['middenvelder'],
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    bowProfile: {
      value: 'low-bow',
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    carbonPercentage: {
      value: 10,
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    lengthsInches: {
      value: [35, 36.5],
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    priceIndicativeEur: {
      value: 89.95,
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    stock: {
      value: 'available',
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    summary: 'Test product summary.',
    strengths: {
      value: ['Test sterk punt'],
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    pointsOfAttention: {
      value: ['Test aandachtspunt'],
      source: 'editorial-estimate',
      lastVerifiedAt: '2026-06-01',
    },
    partnerShop: {
      name: 'Test Winkel',
      url: 'https://example.test/product',
      isSeller: true,
    },
    ...overrides,
  };
}

export function buildProfile(overrides: Partial<QuizProfile> = {}): QuizProfile {
  return {
    buyerType: 'zelf',
    age: null,
    lengthRangeInches: [34, 37.5],
    experienceLevel: 'beginner',
    currentStickExperience: 'nog-geen-stick',
    position: 'middenvelder',
    desiredPlayActions: ['dribbelen'],
    comfortPreference: 'geen-voorkeur',
    preferredBowProfile: 'low-bow',
    budgetMaxEur: 150,
    ...overrides,
  };
}
