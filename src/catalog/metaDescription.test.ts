import { describe, expect, it } from 'vitest';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { getAllProducts, getProductBySlug } from './index';
import { productMetaDescription } from './metaDescription';

/** Absolute or promotional words (CLAUDE.md: no absolute performance claims). */
const CLAIM_WORDS =
  /\b(maximale?|dominan\w*|beste|perfect\w*|ultie\w*|gegarandeerd|garantie|ideaal|ideale|ideal|superieur\w*|onverslaanbaar|ongeëvenaard)\b/i;

const all = getAllProducts(new Date(), { includeImported: true });

describe('productMetaDescription', () => {
  it.each(all.map((p) => [p.slug, p] as const))(
    '%s: fits, has no gaps and no claim words',
    (_slug, product) => {
      const text = productMetaDescription(product);
      expect(text.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      expect(text).not.toMatch(/undefined|null|NaN/);
      expect(text).not.toMatch(CLAIM_WORDS);
    },
  );

  it('describes the Grays JB 10 from its specs', () => {
    const jb10 = getProductBySlug('grays-jb10-composite')!;
    expect(productMetaDescription(jb10)).toBe(
      'Veldstick van Grays met low bow en 95% carbon, voor ervaren spelers. In 36,5, 37,5 en 38,5 inch. Bekijk specs, passende lengte en vergelijkbare sticks.',
    );
  });

  it('leaves out what the catalog does not state', () => {
    const jb10 = getProductBySlug('grays-jb10-composite')!;
    const text = productMetaDescription({
      ...jb10,
      bowProfile: undefined,
      carbonPercentage: undefined,
    });
    expect(text).toMatch(/^Veldstick van Grays, voor ervaren spelers\./);
  });
});

describe('own texts of the curated sticks', () => {
  it('have no absolute or promotional words in summary, strengths or attention points', () => {
    for (const product of getAllProducts(new Date())) {
      const texts = [
        product.summary,
        ...product.strengths.value,
        ...product.pointsOfAttention.value,
      ];
      for (const text of texts)
        expect(text, product.slug).not.toMatch(CLAIM_WORDS);
    }
  });
});

describe('carbon wording', () => {
  it('says "zonder carbon" for a stick with 0% carbon', () => {
    const scoop = getProductBySlug('scoop-wdn-junior-indoor')!;
    expect(productMetaDescription(scoop)).toMatch(
      /^Zaalstick van Scoop met mid bow, zonder carbon, voor beginnende spelers\./,
    );
  });
});
