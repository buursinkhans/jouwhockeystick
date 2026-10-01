import { describe, expect, it } from 'vitest';
import { CATALOG_VERSION, getAllProducts } from '@/catalog';
import { BEST_MATCH_MIN_SCORE, getAdvice } from './engine';
import { applyHardFilters } from './hardFilters';
import { buildPlayerContext } from './playerContext';
import { HIGH_CARBON, deriveAdviceRules } from './productRules';
import { ADVICE_VERSION, RULE_SET_VERSION } from './ruleSetVersion';
import { ROUTE_WEIGHTS } from './scoring';
import {
  NOW,
  buildDevelopAnswers,
  buildPerformanceAnswers,
  buildProduct,
  buildStartAnswers,
  sourced,
} from './testFixtures';
import type { AdviceResult } from './types';

const catalog = getAllProducts();

function bestOf(advice: AdviceResult) {
  const [best] = advice.results;
  if (!best) {
    throw new Error('expected at least one result');
  }
  return best;
}

function expectExplainable(advice: AdviceResult) {
  for (const result of [...advice.results, ...advice.otherSizeOptions]) {
    if (result.role !== 'other_size') {
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    }
    expect(result.breakdown.explanationTags).toEqual(result.reasons.map((reason) => reason.code));
  }
}

describe('route weights', () => {
  it('add up to 100 points for every route', () => {
    for (const weights of Object.values(ROUTE_WEIGHTS)) {
      expect(Object.values(weights).reduce((sum, value) => sum + value, 0)).toBe(100);
    }
  });
});

describe('acceptance scenarios (spec §12) against the real catalog', () => {
  it('1 — first stick for a child: START, around 30 inch, starter sticks only', () => {
    const advice = getAdvice(buildStartAnswers(), catalog);

    expect(advice.route).toBe('START');
    expect(advice.sizeAdvice).toMatchObject({ primaryInch: 30, alternativeInch: 31 });
    expect(advice.results.length).toBeGreaterThan(0);
    expect(advice.results.length).toBeLessThanOrEqual(3);
    expect(bestOf(advice).role).toBe('best_match');
    for (const { product } of advice.results) {
      expect(deriveAdviceRules(product).starterAllowed).toBe(true);
      expect(product.bowProfile?.value).not.toBe('extreme_lowbow');
      expect(product.carbonPercentage?.value ?? 0).toBeLessThan(HIGH_CARBON);
      expect(product.priceIndicativeEur.value).toBeLessThanOrEqual(125);
    }
    expectExplainable(advice);
  });

  it('2 — youth in development: ONTWIKKEL, around 34 inch, with an explicit control-vs-3D trade-off', () => {
    const advice = getAdvice(buildDevelopAnswers(), catalog);

    expect(advice.route).toBe('ONTWIKKEL');
    expect(advice.sizeAdvice).toMatchObject({ primaryInch: 34, alternativeInch: 35 });
    expect(bestOf(advice).role).toBe('best_match');
    for (const result of advice.results) {
      expect(result.product.priceIndicativeEur.value).toBeLessThanOrEqual(175);
      if (result.product.bowProfile?.value === 'lowbow') {
        expect(result.cautions).toContain('LOWBOW_TRADEOFF');
      }
    }
    expectExplainable(advice);
  });

  it('3 — advanced attacker without dragflick role: PRESTATIE, 36.5 inch, no dragflick specialist', () => {
    const dragflickSpecialist = buildProduct({
      slug: 'dragflick-specialist',
      experienceLevel: sourced.level('ervaren'),
      bowProfile: sourced.bow('extreme_lowbow'),
      carbonPercentage: sourced.carbon(90),
      lengthsInches: sourced.lengths([36.5]),
      priceIndicativeEur: sourced.price(240),
    });
    const advice = getAdvice(buildPerformanceAnswers(), [...catalog, dragflickSpecialist]);

    expect(advice.route).toBe('PRESTATIE');
    expect(advice.sizeAdvice.primaryInch).toBe(36.5);
    expect(bestOf(advice).role).toBe('best_match');
    expect(advice.results.map((result) => result.product.slug)).not.toContain('dragflick-specialist');
    // Low bow is allowed here, but the first-touch trade-off must be explicit.
    const lowBowResults = advice.results.filter((result) => result.product.bowProfile?.value === 'lowbow');
    for (const result of lowBowResults) {
      expect(result.cautions).toContain('LOWBOW_TRADEOFF');
    }
    expectExplainable(advice);
  });

  it('4 — ambitious beginner with a high budget: no high-carbon top stick, only a limited step up', () => {
    const advice = getAdvice(
      buildDevelopAnswers({
        age_band: '11_12',
        experience_seasons: '1',
        height_cm: 165,
        first_touch_confidence: 'learning',
        core_skills_stage: 'practicing_basics',
        primary_goals: ['hit'],
        fun_style: 'finishing',
        feel_preference: 'direct',
        budget_band: 'gt_250',
      }),
      catalog,
    );
    const best = bestOf(advice);

    expect(advice.route).toBe('ONTWIKKEL');
    expect(best.product.experienceLevel.value).not.toBe('ervaren');
    for (const { product } of advice.results) {
      expect(product.carbonPercentage?.value ?? 0).toBeLessThan(HIGH_CARBON);
    }
    const ambitious = advice.results.find((result) => result.role === 'ambitious_choice');
    if (ambitious) {
      expect(ambitious.cautions).toContain('AMBITIOUS_STEP');
      expect(deriveAdviceRules(ambitious.product).complexity).toBeLessThanOrEqual(
        deriveAdviceRules(best.product).complexity + 1,
      );
    }
    expectExplainable(advice);
  });

  it('5 — no directly available stock in the needed size: no wrong size as best match', () => {
    const products = [
      buildProduct({ slug: 'a', lengthsInches: sourced.lengths([31]), stock: sourced.stock('limited') }),
      buildProduct({ slug: 'b', lengthsInches: sourced.lengths([30, 31, 32]), stock: sourced.stock('limited') }),
    ];
    const advice = getAdvice(
      buildStartAnswers({ height_cm: 135, availability_preference: 'only_direct' }),
      products,
      { now: NOW },
    );

    expect(advice.sizeAdvice.primaryInch).toBe(31);
    expect(advice.results).toEqual([]);
    expect(advice.otherSizeOptions).toEqual([]);
    expect(advice.noMatchReason).toBe('availability');
    expect(advice.isUncertain).toBe(true);
  });
});

describe('getAdvice', () => {
  it('stamps the advice, rule set and catalog versions and the session id', () => {
    const advice = getAdvice(buildStartAnswers(), catalog, { adviceSessionId: 'session-1' });

    expect(advice).toMatchObject({
      adviceSessionId: 'session-1',
      adviceVersion: ADVICE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      catalogVersion: CATALOG_VERSION,
      methodUrl: '/methodiek',
    });
  });

  it('refers a left-handed request to personal help instead of showing a wrong product', () => {
    const advice = getAdvice(buildStartAnswers({ left_handed_requirement: 'yes' }), catalog);

    expect(advice.referral).toBe('left_handed');
    expect(advice.results).toEqual([]);
    expect(advice.otherSizeOptions).toEqual([]);
  });

  it('offers a shorter size separately — never as a match — when the advised size does not exist', () => {
    const advice = getAdvice(buildStartAnswers({ height_cm: 135 }), catalog);

    expect(advice.noMatchReason).toBe('length');
    expect(advice.results).toEqual([]);
    expect(advice.otherSizeOptions.length).toBeGreaterThan(0);
    for (const option of advice.otherSizeOptions) {
      expect(option.role).toBe('other_size');
      expect(option.sizeInch).toBe(30);
      expect(option.cautions).toContain('OTHER_SIZE');
    }
  });

  it('labels the top result a closest option when it scores below the best-match threshold', () => {
    const weakFit = buildProduct({
      experienceLevel: sourced.level('gevorderd'),
      bowProfile: sourced.bow('lowbow'),
      carbonPercentage: sourced.carbon(80),
      lengthsInches: sourced.lengths([36.5]),
      priceIndicativeEur: sourced.price(60),
    });
    const advice = getAdvice(
      buildDevelopAnswers({
        height_cm: 170,
        first_touch_confidence: 'learning',
        primary_goals: ['first_touch'],
        fun_style: 'build_pass',
        feel_preference: 'soft',
      }),
      [weakFit],
      { now: NOW },
    );

    expect(bestOf(advice).score).toBeLessThan(BEST_MATCH_MIN_SCORE);
    expect(bestOf(advice).role).toBe('closest_option');
    expect(advice.isUncertain).toBe(true);
  });

  it('picks a safe choice that is never more complex than the best match', () => {
    const advice = getAdvice(buildStartAnswers(), catalog);
    const best = bestOf(advice);
    const safe = advice.results.find((result) => result.role === 'safe_choice');

    expect(safe).toBeDefined();
    expect(deriveAdviceRules(safe!.product).complexity).toBeLessThanOrEqual(
      deriveAdviceRules(best.product).complexity,
    );
  });
});

describe('applyHardFilters', () => {
  const filter = (answers: Parameters<typeof buildPlayerContext>[0], products: ReturnType<typeof buildProduct>[]) =>
    applyHardFilters(products, buildPlayerContext(answers, NOW));

  it('reports the budget stage when price is the only thing in the way', () => {
    const result = filter(buildStartAnswers({ budget_band: 'lt_75' }), [buildProduct()]);
    expect(result).toMatchObject({ passed: [], noMatchReason: 'budget' });
  });

  it('skips the budget filter when the user wants to compare first', () => {
    const pricey = buildProduct({ priceIndicativeEur: sourced.price(400) });
    expect(filter(buildStartAnswers({ budget_band: 'compare_first' }), [pricey]).passed).toHaveLength(1);
  });

  it('excludes a stick outside the experience band', () => {
    const elite = buildProduct({ experienceLevel: sourced.level('ervaren'), carbonPercentage: sourced.carbon(60) });
    expect(filter(buildStartAnswers(), [elite]).noMatchReason).toBe('experience');
  });

  it('excludes ~85%+ carbon when the first touch is still in the lower half', () => {
    const stiff = buildProduct({
      experienceLevel: sourced.level('gevorderd'),
      carbonPercentage: sourced.carbon(90),
    });
    expect(filter(buildDevelopAnswers(), [stiff]).noMatchReason).toBe('safety');
    expect(
      filter(buildDevelopAnswers({ first_touch_confidence: 'good_under_pressure' }), [stiff]).passed,
    ).toHaveLength(1);
  });

  it('only allows a dragflick specialist when dragflick plays a role', () => {
    const specialist = buildProduct({
      experienceLevel: sourced.level('ervaren'),
      bowProfile: sourced.bow('extreme_lowbow'),
      carbonPercentage: sourced.carbon(70),
    });
    expect(filter(buildPerformanceAnswers(), [specialist]).noMatchReason).toBe('safety');
    expect(
      filter(buildPerformanceAnswers({ skill_dragflick: 'specialist' }), [specialist]).passed,
    ).toHaveLength(1);
  });

  it('never advises a product with a publication blocker', () => {
    expect(filter(buildStartAnswers(), [buildProduct({ bowProfile: undefined })]).noMatchReason).toBe('data');
  });
});
