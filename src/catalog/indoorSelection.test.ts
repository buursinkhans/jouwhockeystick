import { describe, expect, it } from 'vitest';
import { buildProduct, sourced } from '@/advice-engine/testFixtures';
import { getIndoorProducts } from './index';
import { selectIndoorSticks } from './indoorSelection';

const junior = buildProduct({
  slug: 'junior',
  lengthsInches: sourced.lengths([33, 34]),
  priceIndicativeEur: sourced.price(25),
});
const juniorPricey = buildProduct({
  slug: 'junior-pricey',
  lengthsInches: sourced.lengths([34, 35]),
  priceIndicativeEur: sourced.price(80),
});
const senior = buildProduct({
  slug: 'senior',
  lengthsInches: sourced.lengths([36.5, 37.5]),
  priceIndicativeEur: sourced.price(65),
});
const products = [juniorPricey, senior, junior];

describe('selectIndoorSticks', () => {
  it('looks for both adult lengths for an adult', () => {
    const result = selectIndoorSticks(products, {
      player: 'adult',
      budget: 'geen',
    });

    expect(result.sizes).toEqual([36.5, 37.5]);
    expect(result.matches.map((match) => match.product.slug)).toEqual([
      'senior',
    ]);
    expect(result.sizeAdvice).toBeNull();
  });

  it('uses the length advice for a child, including the second size on a band edge', () => {
    const result = selectIndoorSticks(products, {
      player: 'child',
      heightCm: 148,
      budget: 'geen',
    });

    expect(result.sizes).toEqual([34, 33]);
    expect(result.matches.map((match) => match.product.slug)).toEqual([
      'junior',
      'junior-pricey',
    ]);
    expect(result.matches.every((match) => match.sizeInch === 34)).toBe(true);
  });

  it('lists the advised size before the alternative size, then by price', () => {
    const onlyAlternative = buildProduct({
      slug: 'only-33',
      lengthsInches: sourced.lengths([33]),
      priceIndicativeEur: sourced.price(10),
    });
    const result = selectIndoorSticks([onlyAlternative, juniorPricey], {
      player: 'child',
      heightCm: 148,
      budget: 'geen',
    });

    expect(
      result.matches.map((match) => [
        match.product.slug,
        match.alternativeSize,
      ]),
    ).toEqual([
      ['junior-pricey', false],
      ['only-33', true],
    ]);
  });

  it('drops sticks above the budget and says when budget is the reason for an empty list', () => {
    const result = selectIndoorSticks(products, {
      player: 'child',
      heightCm: 150,
      budget: 'tot_50',
    });
    expect(result.matches.map((match) => match.product.slug)).toEqual([
      'junior',
    ]);

    const none = selectIndoorSticks([juniorPricey], {
      player: 'child',
      heightCm: 150,
      budget: 'tot_50',
    });
    expect(none).toMatchObject({ matches: [], noMatchReason: 'budget' });
  });

  it('says when no stick exists in the needed size', () => {
    const result = selectIndoorSticks(products, {
      player: 'child',
      heightCm: 120,
      budget: 'geen',
    });
    expect(result).toMatchObject({ matches: [], noMatchReason: 'size' });
  });

  it('offers a child one size shorter — never longer — when the advised size does not exist', () => {
    // 135 cm → 31 inch; the junior stick exists in 33/34 and the cheap one in 30.
    const thirty = buildProduct({
      slug: 'thirty',
      lengthsInches: sourced.lengths([30]),
      priceIndicativeEur: sourced.price(20),
    });
    const result = selectIndoorSticks([thirty, junior], {
      player: 'child',
      heightCm: 135,
      budget: 'geen',
    });

    expect(result.matches).toEqual([]);
    expect(result.noMatchReason).toBe('size');
    expect(
      result.shorterSizeMatches.map((match) => [
        match.product.slug,
        match.sizeInch,
      ]),
    ).toEqual([['thirty', 30]]);
  });

  it('never offers a shorter size to an adult or when the advised size exists', () => {
    expect(
      selectIndoorSticks(products, { player: 'adult', budget: 'geen' })
        .shorterSizeMatches,
    ).toEqual([]);
    expect(
      selectIndoorSticks(products, {
        player: 'child',
        heightCm: 150,
        budget: 'geen',
      }).shorterSizeMatches,
    ).toEqual([]);
  });

  it('finds junior and adult options in the real indoor catalog', () => {
    const indoor = getIndoorProducts();
    expect(
      selectIndoorSticks(indoor, { player: 'adult', budget: 'tot_50' }).matches
        .length,
    ).toBeGreaterThan(0);
    expect(
      selectIndoorSticks(indoor, {
        player: 'child',
        heightCm: 148,
        budget: 'tot_50',
      }).matches.length,
    ).toBeGreaterThan(0);
  });
});
