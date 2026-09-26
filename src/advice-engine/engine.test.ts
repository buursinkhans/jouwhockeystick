import { describe, expect, it } from 'vitest';
import { getAdvice } from './engine';
import { RULE_SET_VERSION } from './ruleSetVersion';
import { buildProduct, buildProfile, NOW } from './testFixtures';

describe('getAdvice', () => {
  it('recommends the clear top match and stamps the ruleSetVersion', () => {
    const profile = buildProfile({ experienceLevel: 'ervaren', comfortPreference: 'stevig-krachtig', budgetMaxEur: 300 });
    const strongMatch = buildProduct({
      slug: 'strong-match',
      experienceLevel: { value: 'ervaren', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      carbonPercentage: { value: 60, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      priceIndicativeEur: { value: 100, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const weakMatch = buildProduct({
      slug: 'weak-match',
      experienceLevel: { value: 'beginner', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      carbonPercentage: { value: 5, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      priceIndicativeEur: { value: 250, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });

    const result = getAdvice(profile, [strongMatch, weakMatch], NOW);

    expect(result.ruleSetVersion).toBe(RULE_SET_VERSION);
    expect(result.recommended?.product.slug).toBe('strong-match');
    expect(result.recommended?.reasonCodes.length).toBeGreaterThanOrEqual(2);
    expect(result.isUncertain).toBe(false);
    expect(result.noMatchReason).toBeNull();
  });

  it('marks the result uncertain and still offers an alternative on conflicting/close signals', () => {
    const profile = buildProfile();
    const productA = buildProduct({ slug: 'a' });
    const productB = buildProduct({ slug: 'b' });

    const result = getAdvice(profile, [productA, productB], NOW);

    // Both products are identical, so their scores tie — too close to call.
    expect(result.isUncertain).toBe(true);
    expect(result.recommended).not.toBeNull();
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it('falls back to verified, available alternatives and stays uncertain when nothing passes hard filters', () => {
    const profile = buildProfile({ budgetMaxEur: 10 });
    const tooExpensive = buildProduct({ priceIndicativeEur: { value: 90, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });

    const result = getAdvice(profile, [tooExpensive], NOW);

    expect(result.recommended).toBeNull();
    expect(result.isUncertain).toBe(true);
    expect(result.alternatives.length).toBe(1);
    expect(result.excludedCount).toBe(1);
    // Length was fine (default fixture length matches default profile range) —
    // budget is the actual, single reason nothing passed, not "length and budget".
    expect(result.noMatchReason).toBe('budget');
  });

  it('never returns an out-of-stock or expired product, even as a fallback alternative', () => {
    const profile = buildProfile({ budgetMaxEur: 10 });
    const expired = buildProduct({
      slug: 'expired',
      priceIndicativeEur: { value: 90, source: 'editorial-estimate', lastVerifiedAt: '2020-01-01' },
      experienceLevel: { value: 'beginner', source: 'editorial-estimate', lastVerifiedAt: '2020-01-01' },
    });
    const outOfStock = buildProduct({
      slug: 'out-of-stock',
      priceIndicativeEur: { value: 90, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      stock: { value: 'unavailable', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });

    const result = getAdvice(profile, [expired, outOfStock], NOW);

    expect(result.alternatives).toEqual([]);
    expect(result.noMatchReason).toBe('availability');
  });
});
