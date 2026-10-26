import { describe, expect, it } from 'vitest';
import { isBolUnchecked, isSoldAtBol } from './shop';
import type { PlutoStickModel } from './plutosportFeed';
import { carbonFromText, plutosportGaps, toPlutosportProduct } from './plutosportImport';
import { productSchema } from './types';

function model(overrides: Partial<PlutoStickModel> = {}): PlutoStickModel {
  return {
    key: 'page:https://www.plutosport.nl/the-indian-maharadja-sword-20-hockeystick-senior-10261013',
    name: 'The Indian Maharadja Sword 20 Hockeystick Senior',
    brand: 'The Indian Maharadja',
    modelText: '',
    specText: '',
    description: '',
    url: 'https://www.plutosport.nl/the-indian-maharadja-sword-20-hockeystick-senior-10261013',
    awDeepLink: 'https://www.awin1.com/pclick.php?p=1&a=3132918&m=8342',
    discipline: 'veld',
    junior: false,
    eans: ['8719000000001'],
    sizes: ['36,5', '37,5'],
    sizesInStock: ['36,5', '37,5'],
    priceMin: 66.95,
    priceMax: 66.95,
    inStockPriceMin: 66.95,
    inStock: true,
    categories: [],
    imageUrl: 'https://www.plutosport.nl/media/catalog/product/sword-20.jpg',
    ...overrides,
  };
}

describe('carbonFromText', () => {
  it('takes a percentage the shop states in so many words', () => {
    expect(carbonFromText('Materiaal: 60% carbon, 40% glasvezel')).toBe(60);
    expect(carbonFromText('Carbonpercentage: 20%')).toBe(20);
    expect(carbonFromText('Carbon: 95 %')).toBe(95);
  });

  it('gives nothing when no or several different percentages are named', () => {
    expect(carbonFromText('Een stick met veel carbon voor gevorderden')).toBeNull();
    expect(carbonFromText('Sticks met 30% carbon tot 90% carbon')).toBeNull();
  });
});

describe('toPlutosportProduct', () => {
  it('builds a valid catalog product with only a Plutosport button and sources on every fact', () => {
    const result = toPlutosportProduct(model({ specText: 'Carbon: 20%' }), '2026-10-27');
    expect('product' in result).toBe(true);
    if (!('product' in result)) return;
    const { product } = result;
    expect(() => productSchema.parse(product)).not.toThrow();
    expect(product).toMatchObject({
      slug: 'the-indian-maharadja-sword-20-hockeystick-senior-10261013',
      brand: 'The Indian Maharadja',
      feedImport: { feed: 'plutosport', importedAt: '2026-10-27' },
      plutosportProductUrl: model().url,
      lengthsInches: { value: [36.5, 37.5], source: 'partner-shop', modelYear: 2026 },
      carbonPercentage: { value: 20 },
      priceIndicativeEur: { value: 66.95 },
      experienceLevel: { source: 'editorial-estimate' },
    });
    expect(product.passaSportsProductUrl).toBeUndefined();
    expect(isSoldAtBol(product)).toBe(false);
    expect(isBolUnchecked(product)).toBe(true);
  });

  it('reads the bow from the name, abbreviations included', () => {
    const r = toPlutosportProduct(model({ brand: 'Brabo', name: 'Brabo Tribute 10 PB Hockeystick Senior' }), '2026-10-27');
    expect('product' in r && r.product.bowProfile?.value).toBe('probow');
  });

  it('skips baby and keeper sticks, older collections, unknown brands and sticks without a length', () => {
    const reason = (overrides: Partial<PlutoStickModel>) => {
      const r = toPlutosportProduct(model(overrides), '2026-10-27');
      return 'skip' in r ? r.skip.reason : null;
    };
    expect(reason({ name: "Brabo O'GEEZ Baby 18\" Hockeystick Junior", brand: 'Brabo' })).toBe('babystick');
    expect(reason({ name: 'Osaka Goalie Stick', brand: 'Osaka' })).toBe('keepersstick');
    expect(reason({ url: 'https://www.plutosport.nl/the-indian-maharadja-red-hockeystick-junior-10221065-jr' })).toBe('modeljaar 2022');
    expect(reason({ brand: 'Dita', name: 'Dita Exa 100 Hockeystick' })).toContain('merk');
    expect(reason({ sizesInStock: [] })).toBe('geen leverbare lengte in inches');
  });
});

describe('plutosportGaps', () => {
  it('leaves out matched and sold-out sticks, and keeps one page per model name', () => {
    const gaps = plutosportGaps(
      [
        model({ key: 'a', url: 'https://www.plutosport.nl/sword-20-zwart', name: 'The Indian Maharadja Sword 20 Hockeystick Senior Zwart', sizesInStock: ['36,5'] }),
        model({ key: 'b', url: 'https://www.plutosport.nl/sword-20-blauw', name: 'The Indian Maharadja Sword 20 Hockeystick Senior Blauw' }),
        model({ key: 'c', name: 'The Indian Maharadja Blade 10 Hockeystick Senior' }),
        model({ key: 'd', name: 'The Indian Maharadja Tegha 20 Hockeystick Senior', inStock: false }),
      ],
      new Set(['c']),
    );
    expect(gaps.map((g) => g.key)).toEqual(['b']);
  });
});
