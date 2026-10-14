import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import type { AdviceAnswers } from './answers';
import { getAdvice } from './engine';
import { buildPlayerContext, derivePlayerBand } from './playerContext';
import { BRAND_PREFERENCE_POINTS, ROUTE_WEIGHTS, scoreProduct } from './scoring';
import {
  NOW,
  buildDevelopAnswers,
  buildPerformanceAnswers,
  buildProduct,
  buildStartAnswers,
  sourced,
} from './testFixtures';

const band = (answers: AdviceAnswers) =>
  derivePlayerBand(answers, buildPlayerContext(answers, NOW).route).band;

/** A 12-year-old in a selection team with 4+ seasons, 150 cm (34 inch, or 33). */
const selectionKid = (overrides: Partial<AdviceAnswers> = {}) =>
  buildDevelopAnswers({
    age_band: '11_12',
    experience_seasons: '4_plus',
    height_cm: 150,
    first_touch_confidence: 'good_under_pressure',
    core_skills_stage: 'refining_actions',
    playing_level: 'selection',
    budget_band: '75_125',
    ...overrides,
  });

describe('player level comes from the answers, not from the route', () => {
  it('starts juniors on their age and steps up on a performance signal', () => {
    expect(band(buildStartAnswers({ experience_seasons: 'lt_1' }))).toBe(
      'starter',
    );
    expect(
      band(buildDevelopAnswers({ age_band: '8_10', experience_seasons: '2_3' })),
    ).toBe('starter');
    expect(
      band(
        buildDevelopAnswers({
          age_band: '8_10',
          experience_seasons: '2_3',
          playing_level: 'selection',
        }),
      ),
    ).toBe('developing');
    expect(band(buildDevelopAnswers({ age_band: '13_15' }))).toBe(
      'developing',
    );
    expect(band(selectionKid())).toBe('advanced');
  });

  it('counts the performance route as a signal', () => {
    expect(
      band(
        buildPerformanceAnswers({
          age_band: '11_12',
          experience_seasons: '2_3',
          first_touch_confidence: 'mostly_good',
        }),
      ),
    ).toBe('advanced');
  });

  it('does not step up while the basics are still being learned', () => {
    expect(band(selectionKid({ first_touch_confidence: 'learning' }))).toBe(
      'developing',
    );
  });

  it('keeps a first-season player a beginner, whatever the route', () => {
    expect(
      band(
        buildPerformanceAnswers({ experience_seasons: 'lt_1', age_band: '18_plus' }),
      ),
    ).toBe('starter');
  });

  it('gives the same level for the same answers in another route', () => {
    const answers = selectionKid();
    expect(band({ ...answers, route_self_select: 'next_stick' })).toBe(
      band({ ...answers, route_self_select: 'advanced_compare' }),
    );
  });

  it('defaults young players without a feel preference to a soft stick', () => {
    const ctx = buildPlayerContext(
      buildDevelopAnswers({
        age_band: '8_10',
        feel_preference: 'unknown',
        current_stick_problem: undefined,
      }),
      NOW,
    );
    expect(ctx.feelPreference).toBe('soft');
  });
});

describe('size is checked, not scored', () => {
  it('has no size component in the route weights', () => {
    for (const weights of Object.values(ROUTE_WEIGHTS)) {
      expect(Object.keys(weights)).not.toContain('size');
    }
  });

  it('scores the advised and the second size the same, and ranks the advised size first', () => {
    const inPrimary = buildProduct({
      slug: 'z-primary',
      lengthsInches: sourced.lengths([34]),
    });
    const inSecond = buildProduct({
      slug: 'a-second',
      lengthsInches: sourced.lengths([33]),
    });
    const answers = buildDevelopAnswers({ height_cm: 150 });
    const ctx = buildPlayerContext(answers, NOW);
    expect(scoreProduct(inPrimary, ctx).rankScore).toBe(
      scoreProduct(inSecond, ctx).rankScore,
    );
    const advice = getAdvice(answers, [inSecond, inPrimary], { now: NOW });
    expect(advice.results[0]?.product.slug).toBe('z-primary');
  });
});

describe('a stick that is too simple', () => {
  const beginnerStick = buildProduct({
    slug: 'beginner-33',
    experienceLevel: sourced.level('beginner'),
    lengthsInches: sourced.lengths([33, 34]),
    priceIndicativeEur: sourced.price(80),
  });
  const advancedJunior = buildProduct({
    slug: 'advanced-35',
    experienceLevel: sourced.level('gevorderd'),
    bowProfile: sourced.bow('lowbow'),
    carbonPercentage: sourced.carbon(40),
    lengthsInches: sourced.lengths([35]),
    priceIndicativeEur: sourced.price(110),
  });

  it('is shown as the closest option with a caution, never as a best match', () => {
    const advice = getAdvice(selectionKid(), [beginnerStick], { now: NOW });
    expect(advice.results[0]?.product.slug).toBe('beginner-33');
    expect(advice.results[0]?.role).toBe('closest_option');
    expect(advice.results[0]?.cautions).toContain('BELOW_LEVEL');
  });

  it('no longer leaves the performance route without advice', () => {
    const advice = getAdvice(
      selectionKid({ route_self_select: 'advanced_compare' }),
      [beginnerStick],
      { now: NOW },
    );
    expect(advice.results).toHaveLength(1);
  });

  it('names the better stick that does not exist in the advised size', () => {
    const advice = getAdvice(selectionKid(), [beginnerStick, advancedJunior], {
      now: NOW,
    });
    expect(advice.results.map((r) => r.product.slug)).toEqual(['beginner-33']);
    expect(advice.bestModelOtherSize).toMatchObject({
      product: { slug: 'advanced-35' },
      reason: 'higher_level',
    });
  });

  it('loses the best match to a stick at the player level that scores well enough', () => {
    const atLevel = buildProduct({
      slug: 'at-level',
      experienceLevel: sourced.level('gevorderd'),
      bowProfile: sourced.bow('lowbow'),
      carbonPercentage: sourced.carbon(40),
      lengthsInches: sourced.lengths([34]),
      priceIndicativeEur: sourced.price(110),
    });
    const advice = getAdvice(selectionKid(), [beginnerStick, atLevel], {
      now: NOW,
    });
    expect(advice.results[0]).toMatchObject({
      role: 'best_match',
      product: { slug: 'at-level' },
    });
    expect(advice.bestModelOtherSize).toBeNull();
  });

  it('gets no brand bonus', () => {
    const ctx = buildPlayerContext(
      selectionKid({
        has_current_stick: 'yes',
        current_stick_brand: 'Grays',
        brand_loyalty: 'same_brand',
      }),
      NOW,
    );
    const score = scoreProduct({ ...beginnerStick, brand: 'Grays' }, ctx);
    expect(score.tooSimple).toBe(true);
    expect(score.breakdown.brandFit).toBe(0);
  });
});

describe('budget and brand points', () => {
  it('gives a stick far below the budget a lower budget score', () => {
    const ctx = buildPlayerContext(
      buildDevelopAnswers({ budget_band: '125_175' }),
      NOW,
    );
    const cheap = scoreProduct(
      buildProduct({ priceIndicativeEur: sourced.price(30) }),
      ctx,
    );
    const belowBand = scoreProduct(
      buildProduct({ priceIndicativeEur: sourced.price(100) }),
      ctx,
    );
    const weight = ROUTE_WEIGHTS.ONTWIKKEL.budget;
    expect(cheap.breakdown.budgetFit).toBe(weight * 0.4);
    expect(belowBand.breakdown.budgetFit).toBe(weight * 0.8);
  });

  it('ranks on the uncapped score, so the cap does not erase differences within a brand', () => {
    const answers = buildPerformanceAnswers({
      has_current_stick: 'yes',
      current_stick_brand: 'Grays',
      brand_loyalty: 'same_brand',
      budget_band: '175_250',
    });
    const ctx = buildPlayerContext(answers, NOW);
    const stick = (slug: string, carbon: number, price: number) =>
      buildProduct({
        slug,
        brand: 'Grays',
        experienceLevel: sourced.level('ervaren'),
        bowProfile: sourced.bow('lowbow'),
        carbonPercentage: sourced.carbon(carbon),
        lengthsInches: sourced.lengths([36.5]),
        priceIndicativeEur: sourced.price(price),
        stock: sourced.stock('available'),
      });
    const better = stick('better', 75, 240);
    const weaker = stick('weaker', 50, 190);
    const betterScore = scoreProduct(better, ctx);
    const weakerScore = scoreProduct(weaker, ctx);
    expect(betterScore.breakdown.brandFit).toBe(BRAND_PREFERENCE_POINTS);
    expect(betterScore.rankScore).toBeGreaterThan(weakerScore.rankScore);
    expect(betterScore.breakdown.total).toBeLessThanOrEqual(100);

    const advice = getAdvice(answers, [weaker, better], { now: NOW });
    expect(advice.results[0]?.product.slug).toBe('better');
  });
});

describe('real catalog', () => {
  const catalog = getAllProducts(NOW);

  it('does not advise a beginner stick as best match to a selection player of 34 inch', () => {
    for (const route of ['next_stick', 'advanced_compare'] as const) {
      const advice = getAdvice(
        selectionKid({ route_self_select: route, budget_band: '125_175' }),
        catalog,
        { now: NOW },
      );
      const best = advice.results[0];
      expect(best, route).toBeDefined();
      expect(best?.product.experienceLevel.value, route).not.toBe('beginner');
    }
  });
});
