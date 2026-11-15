import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { roleIntro } from '@/content/stickwijzer/resultCopy';
import { adviceAnswersSchema, type AdviceAnswers } from './answers';
import { getAdvice } from './engine';
import { applyHardFilters, isJuniorModel } from './hardFilters';
import { buildPlayerContext } from './playerContext';
import { isAdultHeight, matchSize } from './sizeAdvice';
import { buildDevelopAnswers, buildPerformanceAnswers, buildProduct, buildStartAnswers } from './testFixtures';

/**
 * Engine review 2026-11-15 (decision log): the advised size comes first.
 * Run against the real catalog, over every height the stickwijzer accepts.
 */
const now = new Date('2026-11-15T12:00:00Z');
const pool = getAllProducts(now, { includeImported: true });
const age = (cm: number): AdviceAnswers['age_band'] => (cm < 150 ? '8_10' : '18_plus');
const PLAYERS: [string, (cm: number) => AdviceAnswers][] = [
  ['start, tot €75', (cm) => buildStartAnswers({ height_cm: cm, age_band: age(cm), budget_band: 'lt_75' })],
  ['ontwikkel, tot €125', (cm) => buildDevelopAnswers({ height_cm: cm, budget_band: '75_125' })],
  ['prestatie, tot €250', (cm) => buildPerformanceAnswers({ height_cm: cm, age_band: '18_plus' })],
];
const HEIGHTS = Array.from({ length: 210 - 95 + 1 }, (_, i) => 95 + i);

describe('the advised size comes first (review findings 1 to 4)', () => {
  it.each(PLAYERS)('%s: the first choice is in the advised size whenever a stick in that size passes', (_, make) => {
    for (const cm of HEIGHTS) {
      const answers = make(cm);
      const advice = getAdvice(answers, pool, { now });
      const ctx = buildPlayerContext(answers, now);
      const inAdvisedSize = applyHardFilters(pool, ctx).passed.some((p) => matchSize(p, ctx.sizeAdvice) === 'primary');
      const first = advice.results[0];
      if (!first) continue;
      if (inAdvisedSize) expect(first.sizeInch, `${cm} cm`).toBe(advice.sizeAdvice.primaryInch);
      else {
        // Only the other size exists: never called a best match, and the advice is marked uncertain.
        expect(first.role, `${cm} cm`).toBe('closest_option');
        expect(advice.isUncertain, `${cm} cm`).toBe(true);
        expect(roleIntro(first)).toContain('In de geadviseerde maat vonden we geen passende stick');
      }
    }
  });

  it.each(PLAYERS)('%s: a child never gets a longer stick than advised, an adult never a junior model or size', (_, make) => {
    for (const cm of HEIGHTS) {
      const advice = getAdvice(make(cm), pool, { now });
      for (const item of [...advice.results, ...advice.otherSizeOptions]) {
        if (isAdultHeight(cm)) {
          expect(item.sizeInch, `${cm} cm ${item.product.slug}`).toBeGreaterThanOrEqual(36.5);
          expect(isJuniorModel(item.product), `${cm} cm ${item.product.slug}`).toBe(false);
        } else {
          expect(item.sizeInch, `${cm} cm ${item.product.slug}`).toBeLessThanOrEqual(advice.sizeAdvice.primaryInch);
        }
      }
      if (isAdultHeight(cm) && advice.bestModelOtherSize) expect(isJuniorModel(advice.bestModelOtherSize.product)).toBe(false);
    }
  });

  it.each(PLAYERS)('%s: one centimetre more inside the same advised size never changes the size of the first choice', (_, make) => {
    for (const cm of HEIGHTS.slice(0, -1)) {
      const [a, b] = [getAdvice(make(cm), pool, { now }), getAdvice(make(cm + 1), pool, { now })];
      if (a.sizeAdvice.primaryInch !== b.sizeAdvice.primaryInch || !a.results[0] || !b.results[0]) continue;
      if (a.results[0].sizeInch === a.sizeAdvice.primaryInch && b.results[0].sizeInch === b.sizeAdvice.primaryInch) continue;
      // Both fell back on the other size: then at least not a jump of more than one size step.
      expect(Math.abs(a.results[0].sizeInch - b.results[0].sizeInch), `${cm} cm`).toBeLessThanOrEqual(1);
    }
  });

  it('says honestly that there is no fitting stick when the advised size does not exist (under 102 cm)', () => {
    const advice = getAdvice(buildStartAnswers({ height_cm: 100, age_band: 'under_8', budget_band: 'lt_75' }), pool, { now });
    expect(advice.sizeAdvice).toMatchObject({ primaryInch: 22 });
    expect(advice.sizeAdvice.alternativeInch).toBeUndefined();
    expect(advice.results).toEqual([]);
    expect(advice.noMatchReason).toBe('length');
    expect(advice.isUncertain).toBe(true);
    // And no longer stick as a fallback either.
    for (const item of advice.otherSizeOptions) expect(item.sizeInch).toBeLessThan(22);
  });

  it('puts a lower-scoring stick in the advised size before a better-scoring one in the other size', () => {
    const answers = buildDevelopAnswers({ height_cm: 180 }); // 36.5 advised, 37.5 the other size
    const exact = buildProduct({ slug: 'advised-size', lengthsInches: { value: [36.5], source: 'brand-website', lastVerifiedAt: '2026-11-01' }, bowProfile: { value: 'ultrabow', source: 'brand-website', lastVerifiedAt: '2026-11-01' }, experienceLevel: { value: 'gevorderd', source: 'brand-website', modelYear: 2026, lastVerifiedAt: '2026-11-01' } });
    const other = buildProduct({ slug: 'other-size', lengthsInches: { value: [37.5], source: 'brand-website', lastVerifiedAt: '2026-11-01' }, bowProfile: { value: 'lowbow', source: 'brand-website', lastVerifiedAt: '2026-11-01' }, experienceLevel: { value: 'gevorderd', source: 'brand-website', modelYear: 2026, lastVerifiedAt: '2026-11-01' }, carbonPercentage: { value: 40, source: 'brand-website', lastVerifiedAt: '2026-11-01' } });
    const advice = getAdvice(answers, [other, exact], { now });
    expect(advice.results[0]!.product.slug).toBe('advised-size');
    // On its own the stick in the other size scores higher.
    const alone = getAdvice(answers, [other], { now }).results[0]!;
    expect(alone.score).toBeGreaterThan(advice.results[0]!.score);
    expect(alone.role).toBe('closest_option');
  });

  it('lets a tall player state a current stick of 37.5 or 38.5 inch', () => {
    const answers = buildPerformanceAnswers({ height_cm: 195, age_band: '18_plus', current_length_inch: '38.5' });
    expect(adviceAnswersSchema.safeParse(answers).success).toBe(true);
    expect(getAdvice(answers, pool, { now }).sizeAdvice.differsFromCurrentInch).toBeUndefined();
  });
});
