import { describe, expect, it } from 'vitest';
import {
  catalogBrand,
  estimateLevel,
  graysFamily,
  isImplausibleCarbon,
  extractBow,
  extractCarbon,
  modelYearFromUrl,
  slugFromUrl,
  toImportedProduct,
} from './feedImport';
import { getCatalogProducts, getImportedProducts } from './index';
import type { PassaStickModel } from './passaFeed';
import { isBolUnchecked, isPassaSportsOnly, isSoldAtBol } from './shop';
import { productSchema } from './types';

const model = (over: Partial<PassaStickModel> = {}): PassaStickModel => ({
  url: 'https://www.passasports.nl/brabo-g-force-pure-20-31565300000',
  name: 'Brabo G-Force Pure 20',
  brand: 'Brabo',
  discipline: 'veld',
  gender: 'Senior',
  description:
    'Belangrijkste kenmerken * Merk: Brabo * Productlijn: Pure * Type kromming: MidBow * Carbonpercentage: 20%De Brabo …',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/4/0/408676_1.jpg',
  eans: ['8717264883103'],
  sizesInches: [30, 36.5, 37.5],
  sizesInStockInches: [36.5, 37.5],
  priceMin: 54.95,
  priceMax: 54.95,
  inStock: true,
  ...over,
});

describe('extracting specs from the feed description', () => {
  it('reads the bow, and falls back to the name', () => {
    expect(extractBow('* Type kromming: Extreme LowBow * Kleur: Zwart', 'X')).toEqual({ bow: 'extreme_lowbow', from: 'omschrijving' });
    expect(extractBow('* Type kromming: MidBowDe stick', 'X')).toEqual({ bow: 'midbow', from: 'omschrijving' });
    expect(extractBow('Geen kenmerken', 'Osaka Probow 25')).toEqual({ bow: 'probow', from: 'naam' });
  });

  it('leaves the bow out when description and name disagree, or the type is not ours', () => {
    expect(extractBow('* Type kromming: ProBow *', 'Grays Dynabow 8')).toEqual({ bow: null, reason: 'tegenstrijdig' });
    expect(extractBow('* Type kromming: Late Bow *', 'TK P2 Late Bow')).toEqual({ bow: null, reason: 'onbekend type' });
    expect(extractBow('niets', 'TK Maxi Junior')).toEqual({ bow: null, reason: 'niet vermeld' });
  });

  it('reads both ways PassaHockey writes the carbon percentage', () => {
    expect(extractCarbon('* Carbonpercentage: 95% *')).toBe(95);
    expect(extractCarbon('* Percentage carbon: 70% *')).toBe(70);
    expect(extractCarbon('* Carbonpercentage: 0%De houten')).toBe(0);
    expect(extractCarbon('geen')).toBeNull();
  });

  it('takes the model year only from brands that put it in the article code', () => {
    expect(modelYearFromUrl('Y1', 'https://www.passasports.nl/y1-adb-30-st-adb-30-26')).toBe(2026);
    expect(modelYearFromUrl('Ritual', 'https://www.passasports.nl/ritual-finesse-55-finesse5526')).toBe(2026);
    expect(modelYearFromUrl('The Indian Maharadja', 'https://www.passasports.nl/indian-maharadja-blade-10-probow-10231006')).toBe(2023);
    expect(modelYearFromUrl('Grays', 'https://www.passasports.nl/grays-gt-3-junior-27067')).toBeNull();
  });

  it('maps PassaHockey brand names to ours', () => {
    expect(catalogBrand('Indian Maharadja')).toBe('The Indian Maharadja');
    expect(catalogBrand('GRAYS')).toBe('Grays');
    expect(catalogBrand('Gribbid')).toBeNull();
  });

  it('estimates the level from carbon and price', () => {
    expect(estimateLevel(95, 300)).toBe('ervaren');
    expect(estimateLevel(40, 90)).toBe('gevorderd');
    expect(estimateLevel(null, 35)).toBe('beginner');
  });
});

describe('import rules (2026-10-19)', () => {
  it('takes the Grays curve from the family in the name', () => {
    expect(graysFamily('Grays JB+ 7 Junior')?.bow).toBe('lowbow');
    expect(graysFamily('Grays DB 4')?.bow).toBe('dynabow');
    expect(graysFamily('Grays AC900 Probow-S')?.bow).toBe('probow');
    expect(graysFamily('Grays Midbow 8')?.bow).toBe('midbow');
    expect(graysFamily('Grays GT 5')).toBeNull();
    const jb = toImportedProduct(
      model({
        url: 'https://www.passasports.nl/grays-jb-5-27056',
        name: 'Grays JB 5',
        brand: 'Grays',
        description: 'Belangrijkste kenmerken * Type kromming: MidBow * Carbonpercentage: 30%',
      }),
      '2026-10-19',
    );
    expect('product' in jb && jb.product.bowProfile?.value).toBe('lowbow');
  });

  it('never estimates a junior stick as experienced', () => {
    expect(estimateLevel(95, 300, true)).toBe('gevorderd');
    expect(estimateLevel(95, 300)).toBe('ervaren');
  });

  it('drops a carbon share that cannot match the price', () => {
    expect(isImplausibleCarbon(100, 48.95)).toBe(true);
    expect(isImplausibleCarbon(100, 250)).toBe(false);
    const cheap = toImportedProduct(
      model({ description: '* Carbonpercentage: 100%', priceMin: 48.95, priceMax: 48.95 }),
      '2026-10-19',
    );
    expect('product' in cheap && cheap.product.carbonPercentage).toBeUndefined();
  });

  it('skips goalie sticks', () => {
    expect('skip' in toImportedProduct(model({ name: 'Brabo Goalie F1 Junior' }), '2026-10-19')).toBe(true);
  });
});

describe('toImportedProduct', () => {
  it('builds a valid, sourced product from the feed', () => {
    const result = toImportedProduct(model(), '2026-10-17');
    if (!('product' in result)) throw new Error('expected a product');
    const p = result.product;
    expect(productSchema.safeParse(p).success).toBe(true);
    expect(p.slug).toBe('brabo-g-force-pure-20-31565300000');
    expect(p.feedImport).toEqual({ feed: 'passahockey', importedAt: '2026-10-17' });
    expect(p.bowProfile?.value).toBe('midbow');
    expect(p.carbonPercentage?.value).toBe(20);
    expect(p.lengthsInches.value).toEqual([36.5, 37.5]);
    expect(p.priceIndicativeEur.value).toBe(54.95);
    expect(p.experienceLevel.source).toBe('editorial-estimate');
    expect(p.bolProductUrl).toBeUndefined();
    expect(p.summary).not.toMatch(/korting|beste/i);
  });

  it('skips what it cannot place or date', () => {
    const reason = (over: Partial<PassaStickModel>) => {
      const result = toImportedProduct(model(over), '2026-10-17');
      return 'skip' in result ? result.skip.reason : 'opgenomen';
    };
    expect(reason({ brand: 'Gribbid' })).toMatch(/merk/);
    expect(reason({ discipline: 'onbekend' })).toMatch(/veld of zaal/);
    expect(reason({ sizesInStockInches: [] })).toMatch(/maat/);
    expect(reason({ name: '126004' })).toMatch(/artikelcode/);
    expect(
      reason({ brand: 'Y1', name: 'Y1 LB 30', url: 'https://www.passasports.nl/y1-lb-30-st-lb-30-24' }),
    ).toMatch(/modeljaar 2024/);
  });

  it('makes stable slugs from the shop page', () => {
    expect(slugFromUrl('https://www.passasports.nl/Brabo_O-Geez/')).toBe('brabo-o-geez');
  });
});

describe('imported catalog', () => {
  const imported = getImportedProducts();
  const curatedSlugs = new Set(getCatalogProducts().map((p) => p.slug));

  it('is valid, marked as import, and does not clash with curated sticks', () => {
    const slugs = new Set<string>();
    for (const product of imported) {
      expect(productSchema.safeParse(product).success, product.slug).toBe(true);
      expect(product.feedImport, product.slug).toBeDefined();
      expect(curatedSlugs.has(product.slug), product.slug).toBe(false);
      expect(slugs.has(product.slug), product.slug).toBe(false);
      slugs.add(product.slug);
    }
  });

  it('links imported sticks to PassaHockey only, without a claim about bol.com', () => {
    for (const product of imported) {
      expect(isSoldAtBol(product)).toBe(false);
      expect(isPassaSportsOnly(product)).toBe(true);
      expect(isBolUnchecked(product)).toBe(true);
    }
  });
});
