import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { buildCompareTable } from '@/catalog/compare';
import { productFacts } from '@/components/catalog/ProductFacts';
import { BENCH_PROFILES } from './benchProfiles';
import { getAdvice } from './engine';
import { countFittingSticks } from './liveCount';

// UX phase 2 (decision log 2026-11-08).
const now = new Date('2026-11-08T12:00:00Z');
const products = getAllProducts(now, { includeImported: true });

describe('live count', () => {
  it('is empty until an answer allows a check, and a lower budget never counts more', () => {
    expect(countFittingSticks({}, products, now)).toBeNull();
    const tall = countFittingSticks({ height_cm: 178 }, products, now)!;
    const cheap = countFittingSticks({ height_cm: 178, budget_band: 'lt_75' }, products, now)!;
    expect(tall).toBeGreaterThan(0);
    expect(cheap).toBeLessThanOrEqual(tall);
  });

  it('never counts fewer sticks than the final advice can show', () => {
    for (const { id, answers } of BENCH_PROFILES) {
      const count = countFittingSticks(answers, products, now)!;
      const advice = getAdvice(answers, products, { now });
      expect(count, id).toBeGreaterThanOrEqual(advice.results.length);
    }
  });
});

describe('compare three sticks', () => {
  it('gives one value per stick in every row, with each stick’s own strength and attention point', () => {
    const three = getAllProducts(now).slice(0, 3);
    const table = buildCompareTable(three);
    for (const row of table) expect(row.values, row.label).toHaveLength(3);
    expect(table.find((r) => r.label === 'Sterk punt')!.values).toEqual(three.map((p) => p.strengths.value[0]));
  });
});

describe('factual badges', () => {
  it('never claim popularity or a best deal, and skip an estimated level', () => {
    for (const product of products) {
      const facts = productFacts(product);
      expect(facts.join(' '), product.slug).not.toMatch(/populair|meest gekozen|beste|prijs\/kwaliteit/i);
      if (product.experienceLevel.source === 'editorial-estimate') {
        expect(facts.some((f) => f.startsWith('Voor ')), product.slug).toBe(false);
      }
    }
  });
});
