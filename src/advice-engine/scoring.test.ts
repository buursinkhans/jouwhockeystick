import { describe, expect, it } from 'vitest';
import { MAX_POSSIBLE_SCORE, scoreProduct } from './scoring';
import { buildProduct, buildProfile } from './testFixtures';

describe('scoreProduct', () => {
  it('awards EXPERIENCE_MATCH when experience levels match', () => {
    const product = buildProduct({ experienceLevel: { value: 'gevorderd', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' } });
    const profile = buildProfile({ experienceLevel: 'gevorderd' });
    const result = scoreProduct(product, profile);
    expect(result.reasonCodes).toContain('EXPERIENCE_MATCH');
  });

  it('never lets position alignment alone outrank a product with more overall matches', () => {
    const profile = buildProfile({ position: 'aanvaller', experienceLevel: 'ervaren', comfortPreference: 'stevig-krachtig' });

    // Only matches on position (price kept above the budget-headroom threshold).
    const positionOnlyMatch = buildProduct({
      slug: 'position-only',
      recommendedPositions: { value: ['aanvaller'], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      experienceLevel: { value: 'beginner', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      carbonPercentage: { value: 5, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      priceIndicativeEur: { value: 140, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });

    // Matches experience + comfort, but not position.
    const betterOverallMatch = buildProduct({
      slug: 'better-overall',
      recommendedPositions: { value: ['verdediger'], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      experienceLevel: { value: 'ervaren', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      carbonPercentage: { value: 60, source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });

    const positionScore = scoreProduct(positionOnlyMatch, profile);
    const overallScore = scoreProduct(betterOverallMatch, profile);

    expect(overallScore.score).toBeGreaterThan(positionScore.score);
  });

  it('caps position weight at no more than 15% of the maximum possible score', () => {
    const profile = buildProfile();
    const positionOnly = buildProduct({
      recommendedPositions: { value: [profile.position], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      experienceLevel: { value: 'ervaren', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
    });
    const withPosition = scoreProduct(positionOnly, profile).score;
    const withoutPosition = scoreProduct(
      buildProduct({
        recommendedPositions: { value: ['keeper'], source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
        experienceLevel: { value: 'ervaren', source: 'editorial-estimate', lastVerifiedAt: '2026-06-01' },
      }),
      profile,
    ).score;
    const positionContribution = withPosition - withoutPosition;
    expect(positionContribution / MAX_POSSIBLE_SCORE).toBeLessThanOrEqual(0.15);
  });

  it('never crashes and never awards PLAYSTYLE_MATCH when bowProfile is unknown', () => {
    const product = buildProduct({ bowProfile: undefined });
    const profile = buildProfile({ preferredBowProfile: 'low-bow' });
    const result = scoreProduct(product, profile);
    expect(result.reasonCodes).not.toContain('PLAYSTYLE_MATCH');
  });

  it('never crashes when carbonPercentage is unknown, and does not falsely claim COMFORT_MATCH for a strong preference', () => {
    const product = buildProduct({ carbonPercentage: undefined });
    const profile = buildProfile({ comfortPreference: 'stevig-krachtig' });
    const result = scoreProduct(product, profile);
    expect(result.reasonCodes).not.toContain('COMFORT_MATCH');
  });

  it('does not penalize a product with an undisclosed carbon percentage below a product with a confirmed non-matching one', () => {
    // A brand that simply doesn't publish carbon% (e.g. Grays) should not
    // score worse on comfort than a competitor whose published carbon%
    // actively contradicts the user's stated preference.
    const undisclosedCarbon = buildProduct({ slug: 'undisclosed', carbonPercentage: undefined });
    const confirmedMismatch = buildProduct({
      slug: 'confirmed-mismatch',
      carbonPercentage: { value: 90, source: 'brand-website', lastVerifiedAt: '2026-06-01' },
    });
    const profile = buildProfile({ comfortPreference: 'licht-wendbaar' });

    const undisclosedScore = scoreProduct(undisclosedCarbon, profile).score;
    const mismatchScore = scoreProduct(confirmedMismatch, profile).score;

    expect(undisclosedScore).toBeGreaterThanOrEqual(mismatchScore);
  });
});
