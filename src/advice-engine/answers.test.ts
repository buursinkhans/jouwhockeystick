import { describe, expect, it } from 'vitest';
import {
  adviceAnswersSchema,
  requiredQuestionIds,
  routeFromSelfSelect,
} from './answers';
import { suggestRoute } from './route';
import { getAllProducts } from '@/catalog';
import { getAdvice } from './engine';
import {
  buildDevelopAnswers,
  buildPerformanceAnswers,
  buildStartAnswers,
} from './testFixtures';

describe('adviceAnswersSchema', () => {
  it('accepts a complete answer set for every route', () => {
    expect(adviceAnswersSchema.safeParse(buildStartAnswers()).success).toBe(
      true,
    );
    expect(adviceAnswersSchema.safeParse(buildDevelopAnswers()).success).toBe(
      true,
    );
    expect(
      adviceAnswersSchema.safeParse(buildPerformanceAnswers()).success,
    ).toBe(true);
  });

  it('requires the route-specific questions and names the missing one', () => {
    const answers = buildPerformanceAnswers({ skill_dragflick: undefined });
    const parsed = adviceAnswersSchema.safeParse(answers);

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path[0])).toEqual([
      'skill_dragflick',
    ]);
  });

  it('asks why a new stick and its brand only when there is a current stick', () => {
    const noStick = buildStartAnswers({
      has_current_stick: 'no',
      replacement_reason: undefined,
    });
    expect(adviceAnswersSchema.safeParse(noStick).success).toBe(true);

    const parsed = adviceAnswersSchema.safeParse(
      buildDevelopAnswers({
        replacement_reason: undefined,
        current_stick_brand: undefined,
      }),
    );
    expect(parsed.error?.issues.map((issue) => issue.path[0])).toEqual([
      'replacement_reason',
      'current_stick_brand',
    ]);
  });

  it('does not require the PRESTATIE skill questions on the START route', () => {
    expect(requiredQuestionIds('START')).not.toContain('skill_hit');
    expect(requiredQuestionIds('START')).not.toContain('primary_goals');
    expect(requiredQuestionIds('PRESTATIE')).toContain('skill_hit');
  });

  it('rejects a height outside 95–210 cm and more than two primary goals', () => {
    expect(
      adviceAnswersSchema.safeParse(buildStartAnswers({ height_cm: 80 }))
        .success,
    ).toBe(false);
    expect(
      adviceAnswersSchema.safeParse(
        buildDevelopAnswers({ primary_goals: ['passing', 'hit', 'aerial'] }),
      ).success,
    ).toBe(false);
  });
});

describe('route', () => {
  it('lets the self-selected situation decide the route', () => {
    expect(routeFromSelfSelect('first_stick')).toBe('START');
    expect(routeFromSelfSelect('next_stick')).toBe('ONTWIKKEL');
    expect(routeFromSelfSelect('advanced_compare')).toBe('PRESTATIE');
  });

  it('suggests START for a young player without a full season', () => {
    expect(suggestRoute({ age_band: '8_10', experience_seasons: 'lt_1' })).toBe(
      'START',
    );
  });

  it('suggests ONTWIKKEL below two seasons or while the basics are still being learned', () => {
    expect(suggestRoute({ age_band: '11_12', experience_seasons: '1' })).toBe(
      'ONTWIKKEL',
    );
    expect(
      suggestRoute({ age_band: '18_plus', experience_seasons: 'trial' }),
    ).toBe('ONTWIKKEL');
    expect(
      suggestRoute({
        age_band: '16_18',
        experience_seasons: '4_plus',
        core_skills_stage: 'practicing_basics',
      }),
    ).toBe('ONTWIKKEL');
  });

  it('suggests PRESTATIE from two seasons up', () => {
    expect(
      suggestRoute({ age_band: '16_18', experience_seasons: '4_plus' }),
    ).toBe('PRESTATIE');
  });
});

describe('"Weet ik nog niet" as route choice (2026-11-08)', () => {
  it('takes the suggested route from age and experience, and the start route before they are known', () => {
    expect(routeFromSelfSelect('unsure')).toBe('START');
    expect(routeFromSelfSelect('unsure', { age_band: '8_10', experience_seasons: 'lt_1' })).toBe('START');
    expect(routeFromSelfSelect('unsure', { age_band: '13_15', experience_seasons: '1' })).toBe('ONTWIKKEL');
    expect(routeFromSelfSelect('unsure', { age_band: '16_18', experience_seasons: '4_plus' })).toBe('PRESTATIE');
  });

  it('gives the same advice as choosing the suggested route yourself', () => {
    const products = getAllProducts(new Date('2026-11-08T12:00:00Z'), { includeImported: true });
    const now = new Date('2026-11-08T12:00:00Z');
    // One season: the suggestion is the development route, the route these answers were made for.
    const chosen = buildDevelopAnswers({ experience_seasons: '1' });
    const unsure = { ...chosen, route_self_select: 'unsure' as const };
    expect(adviceAnswersSchema.safeParse(unsure).success).toBe(true);
    const a = getAdvice(chosen, products, { now });
    const b = getAdvice(unsure, products, { now });
    expect(b.route).toBe(a.route);
    expect(b.results.map((r) => r.product.slug)).toEqual(a.results.map((r) => r.product.slug));
  });
});

describe('quick advice (UX phase 1, 2026-11-08)', () => {
  const now = new Date('2026-11-08T12:00:00Z');
  const products = getAllProducts(now, { includeImported: true });
  const quick = {
    advice_goal: 'child',
    route_self_select: 'quick',
    age_band: '8_10',
    height_cm: 132,
    experience_seasons: 'lt_1',
    budget_band: '75_125',
  } as const;

  it('needs only who, age, height, seasons and budget', () => {
    expect(adviceAnswersSchema.safeParse(quick).success).toBe(true);
    const withoutHeight = Object.fromEntries(Object.entries(quick).filter(([key]) => key !== 'height_cm'));
    expect(adviceAnswersSchema.safeParse(withoutHeight).success).toBe(false);
  });

  it('gives an advice in the advised size and within the budget, from the suggested route', () => {
    const advice = getAdvice(adviceAnswersSchema.parse(quick), products, { now });
    expect(advice.route).toBe('START');
    expect(advice.results.length).toBeGreaterThan(0);
    for (const r of advice.results) expect(r.product.priceIndicativeEur.value).toBeLessThanOrEqual(125);
  });

  it('a player with four seasons is not stepped up on quick advice alone: technique was not asked', () => {
    const advice = getAdvice(
      adviceAnswersSchema.parse({ ...quick, advice_goal: 'self', age_band: '18_plus', height_cm: 178, experience_seasons: '4_plus' }),
      products,
      { now },
    );
    expect(advice.playerLevel.band).toBe('developing');
  });
});
