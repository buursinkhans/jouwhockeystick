import { describe, expect, it } from 'vitest';
import { getAllProducts, getCatalogProducts } from '@/catalog';
import { getModelYear } from '@/catalog/modelYear';
import type { Product } from '@/catalog/types';
import { evidenceGaps, sourceMix, sourceMixText, verdictLine } from './evidence';
import { adviceSteps } from './stickwijzer/resultCopy';

describe('adviceSteps', () => {
  it('tells how this advice was made, with its own numbers and without fees', () => {
    const steps = adviceSteps(67, 2);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toContain('bleven er 67 over');
    expect(steps[1]).toContain('Vergoeding, marge en winkel tellen daarbij niet mee');
    expect(steps[2]).toContain('De 2 sticks');
    expect(adviceSteps(1, 1)[0]).toContain('bleef er 1 over');
  });
});

const curated = getCatalogProducts();
const all = getAllProducts(new Date(), { includeImported: true });
const withBoth = curated.find((p) => p.bowProfile && p.carbonPercentage)!;

describe('verdictLine', () => {
  it('says the stick in one concrete line from its own specs', () => {
    const line = verdictLine(withBoth, 34);
    expect(line).toMatch(/^Kort gezegd: een .+ met \d+% carbon, in 34 inch\.$/);
  });

  it('says nothing when neither bow nor carbon is known', () => {
    const bare = { ...withBoth, bowProfile: undefined, carbonPercentage: undefined } as Product;
    expect(verdictLine(bare, 34)).toBeNull();
  });
});

describe('sourceMix', () => {
  it('counts every listed spec once, by its own source', () => {
    for (const p of all.slice(0, 50)) {
      const mix = sourceMix(p);
      expect(mix.brand + mix.shop + mix.estimate).toBeLessThanOrEqual(mix.total);
      expect(mix.total).toBeGreaterThan(0);
    }
  });

  it('reads as a sentence with the brand name', () => {
    const text = sourceMixText(withBoth);
    expect(text).toMatch(/^Van de \d+ gegevens over deze stick komen er /);
    expect(text.endsWith('.')).toBe(true);
  });
});

describe('evidenceGaps', () => {
  it('names each missing spec and always that we did not test the stick ourselves', () => {
    const bare = { ...withBoth, bowProfile: undefined, carbonPercentage: undefined, weightGrams: undefined } as Product;
    const gaps = evidenceGaps(bare, null);
    expect(gaps).toEqual([
      'De kromming staat niet in de gegevens van merk of winkel.',
      'Het carbonpercentage is niet vermeld.',
      'Het gewicht is niet vermeld.',
      'Het modeljaar is niet bevestigd.',
      'We hebben deze stick niet zelf in de hand gehad of gemeten.',
    ]);
  });

  it('says when a key spec comes from a shop instead of the brand', () => {
    const shopSourced = all.find((p) => p.carbonPercentage?.source === 'partner-shop');
    if (!shopSourced) return;
    expect(evidenceGaps(shopSourced, getModelYear(shopSourced) ?? null).join(' ')).toMatch(/komt van een winkel|komen van een winkel/);
  });
});
