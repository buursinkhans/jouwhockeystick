import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { BENCH_PROFILES } from './benchProfiles';
import { getAdvice } from './engine';
import { adviceLevel, deriveAdviceRules, getAdviceBlockers } from './productRules';
import { brandVerifiedCount } from './scoring';

// Invariants of the stickwijzer (owner, 2026-11-08), on the real catalog and the fixed bench profiles.
const now = new Date('2026-11-08T12:00:00Z');
const products = getAllProducts(now, { includeImported: true });
const profile = (id: string) => BENCH_PROFILES.find((p) => p.id === id)!.answers;
const advise = (id: string) => getAdvice(profile(id), products, { now });

describe('stickwijzer invariants', () => {
  it('the chosen route or a selection team alone never raises the level', () => {
    const level = advise('jeugd').playerLevel.band;
    expect(advise('jeugd-prestatie').playerLevel.band).toBe(level);
    expect(advise('jeugd-selectie').playerLevel.band).toBe(level);
  });

  it('a brand preference never shows a stick above the budget', () => {
    const advice = advise('competitie-merk-krap');
    expect(advice.results.length).toBeGreaterThan(0);
    for (const r of advice.results) expect(r.product.priceIndicativeEur.value).toBeLessThanOrEqual(75);
  });

  it('a higher budget never puts a dearer stick first because it is dearer', () => {
    for (const [low, high] of [
      ['kind-eerste', 'kind-eerste-ruim'],
      ['volw-eerste', 'volw-eerste-ruim'],
      ['jeugd', 'jeugd-ruim'],
    ] as const) {
      const a = advise(low).results[0];
      const b = advise(high).results[0];
      expect(a && b, low).toBeTruthy();
      // The budget gives no points beyond "within the maximum": the new first pick wins on fit,
      // or at an equal score on more brand-verified specs or a simpler build, never on price.
      if (a!.product.slug !== b!.product.slug) {
        const wins =
          b!.score > a!.score ||
          brandVerifiedCount(b!.product) > brandVerifiedCount(a!.product) ||
          deriveAdviceRules(b!.product).complexity < deriveAdviceRules(a!.product).complexity;
        expect(wins, `${low}: ${a!.product.slug} -> ${b!.product.slug}`).toBe(true);
      }
    }
  });

  it('a feed stick never gets its advice level from its price', () => {
    for (const p of products.filter((p) => p.feedImport && p.experienceLevel.source === 'editorial-estimate')) {
      if (p.carbonPercentage === undefined) {
        expect(adviceLevel(p), p.slug).toBeNull();
        expect(getAdviceBlockers(p, now), p.slug).toContain('unknown_level');
      } else {
        expect(adviceLevel(p), p.slug).not.toBeNull();
      }
    }
  });

  it('the same answers and catalog give the same advice', () => {
    for (const { id } of BENCH_PROFILES) {
      const names = (r: ReturnType<typeof advise>) => r.results.map((i) => i.product.slug);
      expect(names(advise(id))).toEqual(names(advise(id)));
    }
  });
});
