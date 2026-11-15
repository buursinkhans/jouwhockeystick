import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { estimateLevel, levelEstimateLabel } from '@/catalog/feedImport';
import type { AdviceAnswers } from './answers';
import { getAdvice } from './engine';
import { BAND_ORDER, adviceLevel, deriveAdviceRules, getAdviceBlockers } from './productRules';
import { buildDevelopAnswers, buildPerformanceAnswers, buildProduct, buildStartAnswers } from './testFixtures';

/** Engine review 2026-11-15, PR 2 (decision log): ranking and level rules, against the real catalog. */
const now = new Date('2026-11-15T12:00:00Z');
const pool = getAllProducts(now, { includeImported: true });
const lowBow = (bow: string | undefined) => bow === 'lowbow' || bow === 'extreme_lowbow';
const level = (p: Parameters<typeof deriveAdviceRules>[0]) => BAND_ORDER.indexOf(deriveAdviceRules(p).homeBand);
const HEIGHTS = [102, 118, 130, 140, 150, 158, 160, 165, 175, 186, 195];
const PROFILES: AdviceAnswers[] = HEIGHTS.flatMap((cm) => [
  buildStartAnswers({ height_cm: cm, age_band: cm < 150 ? '8_10' : '18_plus', budget_band: 'lt_75' }),
  buildDevelopAnswers({ height_cm: cm, budget_band: '75_125' }),
  buildDevelopAnswers({ height_cm: cm, budget_band: 'lt_75' }),
  buildDevelopAnswers({ height_cm: cm, first_touch_confidence: 'learning', core_skills_stage: 'practicing_basics', feel_preference: 'direct' }),
  buildDevelopAnswers({ height_cm: cm, age_band: '8_10' }),
  buildPerformanceAnswers({ height_cm: cm, age_band: '18_plus' }),
  buildPerformanceAnswers({ height_cm: cm, age_band: '18_plus', budget_band: 'gt_250', vibration_sensitivity: 'yes' }),
  buildPerformanceAnswers({ height_cm: cm, age_band: '8_10', experience_seasons: 'trial', skill_dragflick: 'specialist', primary_goals: ['dragflick', 'aerial'], budget_band: 'gt_250' }),
]);

describe('ranking and level rules (review findings 5 to 8, 11, 12, 14)', () => {
  it('breaks a tie on the simpler and then the cheaper stick, not on brand data', () => {
    const base = { lengthsInches: { value: [36.5], source: 'brand-website' as const, lastVerifiedAt: '2026-11-01' }, experienceLevel: { value: 'gevorderd' as const, source: 'brand-website' as const, modelYear: 2026, lastVerifiedAt: '2026-11-01' } };
    const documented = buildProduct({ ...base, slug: 'documented-dear', priceIndicativeEur: { value: 140, source: 'brand-website', lastVerifiedAt: '2026-11-01' } });
    const shopOnly = buildProduct({ ...base, slug: 'shop-cheap', bowProfile: { value: 'midbow', source: 'partner-shop', sourceUrl: 'https://example.com', lastVerifiedAt: '2026-11-01' }, priceIndicativeEur: { value: 90, source: 'partner-shop', sourceUrl: 'https://example.com', lastVerifiedAt: '2026-11-01' } });
    const advice = getAdvice(buildDevelopAnswers({ height_cm: 170, budget_band: '125_175' }), [documented, shopOnly], { now });
    expect(advice.results[0]!.score).toBe(advice.results[1]!.score);
    expect(advice.results.map((r) => r.product.slug)).toEqual(['shop-cheap', 'documented-dear']);
  });

  it('never makes the first choice dearer at an equal score when the budget goes up', () => {
    for (const cm of HEIGHTS) {
      const [low, high] = (['75_125', '125_175'] as const).map((budget_band) => getAdvice(buildDevelopAnswers({ height_cm: cm, budget_band }), pool, { now }).results[0]);
      if (!low || !high || high.score !== low.score) continue;
      expect(high.product.priceIndicativeEur.value, `${cm} cm`).toBeLessThanOrEqual(low.product.priceIndicativeEur.value);
    }
  });

  it('never gives a starter, or a player still learning the basics, a low bow as first or safe choice', () => {
    for (const answers of PROFILES) {
      const advice = getAdvice(answers, pool, { now });
      const early = advice.playerLevel.band === 'starter' || answers.first_touch_confidence === 'learning' || answers.core_skills_stage === 'practicing_basics' || advice.route === 'START';
      if (!early) continue;
      for (const item of advice.results.filter((r) => r.role !== 'ambitious_choice')) {
        expect(lowBow(item.product.bowProfile?.value), `${answers.height_cm} cm ${advice.route} ${item.role} ${item.product.slug}`).toBe(false);
      }
    }
  });

  it('never calls a stick for a lower level than the first choice the ambitious choice', () => {
    for (const answers of PROFILES) {
      const { results } = getAdvice(answers, pool, { now });
      const ambitious = results.find((r) => r.role === 'ambitious_choice');
      if (ambitious) expect(level(ambitious.product), `${answers.height_cm} cm ${ambitious.product.slug}`).toBeGreaterThanOrEqual(level(results[0]!.product));
    }
  });

  it('gives a player who is sensitive to vibrations no very stiff stick as the ambitious choice', () => {
    for (const cm of HEIGHTS) {
      const { results } = getAdvice(buildPerformanceAnswers({ height_cm: cm, age_band: '18_plus', budget_band: 'gt_250', vibration_sensitivity: 'yes' }), pool, { now });
      const ambitious = results.find((r) => r.role === 'ambitious_choice');
      if (ambitious) expect(ambitious.product.carbonPercentage?.value ?? 0, `${cm} cm`).toBeLessThan(85);
    }
  });

  it('never estimates a low bow as a beginner stick, in the import and in the advice', () => {
    expect(estimateLevel(15, 60, true, 'lowbow')).toBe('gevorderd');
    expect(estimateLevel(15, 60, true, 'midbow')).toBe('beginner');
    expect(estimateLevel(null, 60, false, 'extreme_lowbow')).toBe('gevorderd');
    expect(levelEstimateLabel('PassaHockey', 15, 60, true, 'lowbow')).toContain('Door de low bow');
    expect(levelEstimateLabel('PassaHockey', 15, 60, true, 'midbow')).not.toContain('low bow');
    // Every feed stick whose level is our estimate: the advice never treats a low bow as a beginner stick.
    const estimated = pool.filter((p) => p.feedImport && p.experienceLevel.source === 'editorial-estimate' && lowBow(p.bowProfile?.value));
    expect(estimated.length).toBeGreaterThan(0);
    for (const product of estimated) expect(adviceLevel(product), product.slug).not.toBe('beginner');
    // And no hand-checked stick with a low bow is a beginner stick either (owner, 2026-11-15).
    for (const product of pool.filter((p) => !p.feedImport && lowBow(p.bowProfile?.value))) {
      expect(product.experienceLevel.value, product.slug).not.toBe('beginner');
    }
  });

  it('blocks a beginner stick with 70% carbon or more', () => {
    const stiff = (value: number) => buildProduct({ carbonPercentage: { value, source: 'brand-website', lastVerifiedAt: '2026-11-01' } });
    expect(getAdviceBlockers(stiff(70), now)).toContain('illogical_starter_flag');
    expect(getAdviceBlockers(stiff(69), now)).not.toContain('illogical_starter_flag');
  });
});
