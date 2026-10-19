/**
 * Which imported PassaHockey sticks to enrich first (docs/catalogus-verrijker.md).
 * PassaHockey's feed has no sales or stock counts, so popularity comes from
 * how often the stickwijzer advises a stick and whether it is among bol.com's
 * most popular hockey sticks (the weekly market scan). Pure: the counts are
 * computed in scripts/catalog-enrich-list.ts.
 */
import { isCovered } from './gaps';
import type { Product } from './types';

export type AdviceCount = { inAdvice: number; bestMatch: number };

export type EnrichCandidate = {
  product: Product;
  inAdvice: number;
  bestMatch: number;
  bolPopular: boolean;
  score: number;
};

/** Points for appearing in bol.com's popular list: worth about 50 advices. */
const BOL_POPULAR_POINTS = 50;

export function rankForEnrichment(
  imported: readonly Product[],
  counts: ReadonlyMap<string, AdviceCount>,
  bolPopularTitles: readonly string[],
): EnrichCandidate[] {
  return imported
    .map((product) => {
      const { inAdvice, bestMatch } = counts.get(product.slug) ?? {
        inAdvice: 0,
        bestMatch: 0,
      };
      const bolPopular = bolPopularTitles.some((title) =>
        isCovered({ title }, [{ brand: product.brand, name: product.name }]),
      );
      return {
        product,
        inAdvice,
        bestMatch,
        bolPopular,
        score: inAdvice + 2 * bestMatch + (bolPopular ? BOL_POPULAR_POINTS : 0),
      };
    })
    .filter((c) => c.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.product.priceIndicativeEur.value - b.product.priceIndicativeEur.value ||
        a.product.slug.localeCompare(b.product.slug),
    );
}
