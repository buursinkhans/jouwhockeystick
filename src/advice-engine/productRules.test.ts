import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { deriveAdviceRules, getAdviceBlockers } from './productRules';
import { NOW, buildProduct, sourced } from './testFixtures';

describe('deriveAdviceRules', () => {
  it('allows a soft beginner stick for starters', () => {
    const rules = deriveAdviceRules(buildProduct());
    expect(rules).toMatchObject({
      homeBand: 'starter',
      maxBand: 'developing',
      starterAllowed: true,
      feel: 'soft',
    });
  });

  it('marks an extreme low bow as a dragflick specialist and never starter-allowed', () => {
    const rules = deriveAdviceRules(
      buildProduct({ bowProfile: sourced.bow('extreme_lowbow') }),
    );
    expect(rules.dragflickSpecialist).toBe(true);
    expect(rules.starterAllowed).toBe(false);
  });

  it('leaves feel unknown when the brand publishes no carbon percentage', () => {
    expect(
      deriveAdviceRules(buildProduct({ carbonPercentage: undefined })).feel,
    ).toBeNull();
  });

  it('ranks a high-carbon low bow for experienced players as more complex than a starter stick', () => {
    const starter = deriveAdviceRules(buildProduct());
    const elite = deriveAdviceRules(
      buildProduct({
        experienceLevel: sourced.level('ervaren'),
        bowProfile: sourced.bow('lowbow'),
        carbonPercentage: sourced.carbon(95),
      }),
    );
    expect(elite.complexity).toBeGreaterThan(starter.complexity);
    expect(elite.eliteOnly).toBe(true);
  });
});

describe('getAdviceBlockers', () => {
  it('has no blockers for a complete, sourced product', () => {
    expect(getAdviceBlockers(buildProduct(), NOW)).toEqual([]);
  });

  it('blocks a product without a bow profile or model year', () => {
    const product = buildProduct({
      bowProfile: undefined,
      experienceLevel: {
        value: 'beginner',
        source: 'brand-website',
        lastVerifiedAt: '2026-06-01',
      },
    });
    expect(getAdviceBlockers(product, NOW)).toEqual([
      'missing_bow',
      'unknown_model_year',
    ]);
  });

  it('blocks an editorial bow estimate that has no traceable source', () => {
    const product = buildProduct({
      bowProfile: {
        value: 'midbow',
        source: 'editorial-estimate',
        lastVerifiedAt: '2026-06-01',
      },
    });
    expect(getAdviceBlockers(product, NOW)).toEqual(['missing_core_source']);
  });

  it('blocks an unavailable product, an expired verification and an illogical starter flag', () => {
    expect(
      getAdviceBlockers(
        buildProduct({ stock: sourced.stock('unavailable') }),
        NOW,
      ),
    ).toEqual(['unavailable']);
    expect(
      getAdviceBlockers(
        buildProduct({ carbonPercentage: sourced.carbon(95) }),
        NOW,
      ),
    ).toEqual(['illogical_starter_flag']);
    expect(
      getAdviceBlockers(
        buildProduct({
          experienceLevel: {
            value: 'beginner',
            source: 'brand-website',
            modelYear: 2024,
            lastVerifiedAt: '2025-01-01',
          },
        }),
        NOW,
      ),
    ).toEqual(['unverified']);
  });
});

describe('real catalog', () => {
  it('only blocks the products we know have incomplete source data', () => {
    const blocked = getAllProducts()
      .filter((product) => getAdviceBlockers(product).length > 0)
      .map((product) => product.slug)
      .sort();

    // Both adidas models come from a bol.com listing without a stated model
    // year; the Estro .75 LE also has no stated bow profile.
    expect(blocked).toEqual(['adidas-estro-4', 'adidas-estro-75-le']);
  });
});
