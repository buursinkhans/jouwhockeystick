import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import type { Brand } from '@/catalog/types';
import { getAdvice } from './engine';
import { BRAND_PREFERENCE_POINTS } from './scoring';
import {
  NOW,
  buildDevelopAnswers,
  buildPerformanceAnswers,
  buildStartAnswers,
} from './testFixtures';

const catalog = getAllProducts(new Date('2026-10-12T12:00:00Z'));

const loyalTo = (brand: Brand) =>
  ({
    has_current_stick: 'yes',
    current_stick_brand: brand,
    brand_loyalty: 'same_brand',
  }) as const;

describe('brand preference', () => {
  it('puts a well-fitting stick of the preferred brand first and says why', () => {
    const advice = getAdvice(
      buildPerformanceAnswers({ ...loyalTo('Grays'), budget_band: 'gt_250' }),
      catalog,
      { now: NOW },
    );
    const best = advice.results[0];
    expect(best?.product.brand).toBe('Grays');
    expect(best?.reasons.map((r) => r.code)).toContain('BRAND_PREFERENCE');
    expect(best?.breakdown.brandFit).toBe(BRAND_PREFERENCE_POINTS);
    expect(advice.brandPreference).toMatchObject({
      brand: 'Grays',
      matched: true,
    });
  });

  it('puts the brand first even when another brand fits better', () => {
    // A developing 154 cm junior: the only Grays that passes is a beginner stick.
    const advice = getAdvice(
      buildDevelopAnswers({ ...loyalTo('Grays'), budget_band: 'gt_250' }),
      catalog,
      { now: NOW },
    );
    expect(advice.results[0]?.product.brand).toBe('Grays');
    expect(advice.results[0]?.role).toBe('same_brand');
    expect(advice.results[1]?.role).toBe('other_brand');
    expect(advice.results[1]?.product.brand).not.toBe('Grays');
    expect(advice.noAmbitiousReason).toBeNull();
    expect(advice.brandPreference).toMatchObject({
      brand: 'Grays',
      matched: true,
    });
  });

  it('always puts a Grays first for a Grays-loyal player when one exists in the size', () => {
    for (const height of [120, 132, 145, 158, 172, 185])
      for (const budget of ['lt_75', '75_125', '175_250'] as const)
        for (const build of [
          buildStartAnswers,
          buildDevelopAnswers,
          buildPerformanceAnswers,
        ]) {
          const advice = getAdvice(
            build({
              ...loyalTo('Grays'),
              budget_band: budget,
              height_cm: height,
            }),
            catalog,
            { now: NOW },
          );
          if (advice.brandPreference?.missReason === 'length') continue;
          expect(
            advice.results[0]?.product.brand,
            `${build.name} ${height} ${budget}`,
          ).toBe('Grays');
        }
  });

  it('always offers at least one stick of another brand', () => {
    for (const budget of ['lt_75', '75_125', '125_175', 'gt_250'] as const) {
      for (const answers of [
        buildDevelopAnswers({ ...loyalTo('Grays'), budget_band: budget }),
        buildPerformanceAnswers({ ...loyalTo('Grays'), budget_band: budget }),
      ]) {
        const advice = getAdvice(answers, catalog, { now: NOW });
        if (advice.results.length === 0) continue;
        expect(
          advice.results.some((r) => r.product.brand !== 'Grays'),
          `${answers.route_self_select} ${budget}`,
        ).toBe(true);
      }
    }
  });

  it('adds no points when the player is open to other brands', () => {
    const advice = getAdvice(
      buildDevelopAnswers({
        has_current_stick: 'yes',
        current_stick_brand: 'Grays',
        brand_loyalty: 'open',
      }),
      catalog,
      { now: NOW },
    );
    expect(advice.brandPreference).toBeNull();
    for (const result of advice.results) {
      expect(result.breakdown.brandFit).toBe(0);
      expect(['same_brand', 'other_brand']).not.toContain(result.role);
    }
  });

  it('ignores stale brand answers when there is no current stick', () => {
    const advice = getAdvice(
      buildStartAnswers({
        has_current_stick: 'no',
        current_stick_brand: 'Grays',
        brand_loyalty: 'same_brand',
      }),
      catalog,
      { now: NOW },
    );
    expect(advice.brandPreference).toBeNull();
  });

  it('says so when no stick of the brand fits, and still gives advice', () => {
    // Malik has no beginner field sticks in the catalog: nothing passes for a first stick.
    const advice = getAdvice(buildStartAnswers(loyalTo('Malik')), catalog, {
      now: NOW,
    });
    expect(advice.brandPreference).toMatchObject({
      brand: 'Malik',
      matched: false,
    });
    expect(advice.brandPreference?.missReason).not.toBeNull();
    expect(advice.results.length).toBeGreaterThan(0);
  });

  it('never lets the brand points push a score above 100', () => {
    const advice = getAdvice(
      buildStartAnswers({ ...loyalTo('Reece'), budget_band: 'lt_75' }),
      catalog,
      { now: NOW },
    );
    for (const result of advice.results) {
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('shows a stick of the brand above budget, with a caution, when none fits within it', () => {
    const advice = getAdvice(
      buildPerformanceAnswers({
        ...loyalTo('Grays'),
        advice_goal: 'self',
        age_band: '18_plus',
        height_cm: 178,
        budget_band: 'lt_75',
      }),
      catalog,
      { now: NOW },
    );
    const own = advice.results.find((r) => r.product.brand === 'Grays');
    expect(own?.role).toBe('same_brand');
    expect(own?.cautions).toContain('ABOVE_BUDGET');
    expect(advice.results.some((r) => r.product.brand !== 'Grays')).toBe(true);
    // Only the brand's own stick may exceed the budget.
    for (const r of advice.results.filter((r) => r.product.brand !== 'Grays')) {
      expect(r.cautions).not.toContain('ABOVE_BUDGET');
    }
  });

  it('explains why when the brand has no stick in the advised size', () => {
    const noGraysInSize = catalog.filter(
      (p) => p.brand !== 'Grays' || !p.lengthsInches.value.includes(36.5),
    );
    const advice = getAdvice(
      buildPerformanceAnswers({ ...loyalTo('Grays'), height_cm: 170 }),
      noGraysInSize.filter(
        (p) =>
          p.brand !== 'Grays' || p.lengthsInches.value.every((l) => l < 34),
      ),
      { now: NOW },
    );
    expect(advice.brandPreference).toEqual({
      brand: 'Grays',
      matched: false,
      missReason: 'length',
    });
  });
});
