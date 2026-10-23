import { describe, expect, it } from 'vitest';
import { getIndoorProducts } from './index';
import { INDOOR_TIERS, inTier, tierPicks } from './indoorTiers';

const products = getIndoorProducts(new Date('2026-10-23'));

describe('INDOOR_TIERS', () => {
  it('puts every indoor stick in exactly one price group', () => {
    for (const product of products) {
      expect(INDOOR_TIERS.filter((tier) => inTier(product, tier))).toHaveLength(
        1,
      );
    }
  });
});

describe('tierPicks', () => {
  it('picks at most three available sticks from the right price group', () => {
    for (const tier of INDOOR_TIERS) {
      const picks = tierPicks(products, tier);
      expect(picks.length).toBeLessThanOrEqual(3);
      for (const pick of picks) {
        expect(inTier(pick, tier)).toBe(true);
        expect(pick.stock.value).not.toBe('unavailable');
      }
    }
  });
});

describe('tierPicks variety', () => {
  it('shows one stick per brand and an adult stick when the group has one', () => {
    for (const tier of INDOOR_TIERS) {
      const picks = tierPicks(products, tier);
      expect(new Set(picks.map((p) => p.brand)).size).toBe(picks.length);
    }
  });
});
