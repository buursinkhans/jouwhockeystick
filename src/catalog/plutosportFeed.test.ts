import { describe, expect, it } from 'vitest';
import type { CsvRow } from '@/lib/csv';
import {
  collectSticks,
  isHockeyStickRow,
  matchStick,
  normalSize,
  overlapSummary,
  sameBrand,
  seasonYear,
  type CatalogStick,
  type OverlapRow,
  type PlutoStickModel,
} from './plutosportFeed';

function row(overrides: Partial<CsvRow> = {}): CsvRow {
  return {
    aw_product_id: '1',
    aw_deep_link: 'https://www.awin1.com/pclick.php?p=1&a=3132918&m=8342',
    merchant_deep_link: 'https://www.plutosport.nl/grays-jb12-plus?size=36.5',
    product_name: 'Grays JB12+ Jumbow Hockeystick 2025/26',
    search_price: '349.95',
    currency: 'EUR',
    brand_name: 'Grays',
    merchant_product_category_path: 'Hockey > Hockeysticks > Veldhockeysticks',
    in_stock: '1',
    stock_quantity: '3',
    is_for_sale: '1',
    'Fashion:size': '36.5',
    parent_product_id: 'P1',
    ean: '5056323712345',
    ...overrides,
  };
}

function model(overrides: Partial<PlutoStickModel> = {}): PlutoStickModel {
  return {
    key: 'parent:P1',
    name: 'Grays JB12+ Jumbow Hockeystick 2025/26',
    brand: 'Grays',
    modelText: '',
    specText: '',
    url: 'https://www.plutosport.nl/grays-jb12-plus',
    awDeepLink: 'https://www.awin1.com/pclick.php?p=1&a=3132918&m=8342',
    discipline: 'veld',
    junior: false,
    eans: [],
    sizes: ['36,5'],
    sizesInStock: ['36,5'],
    priceMin: 349.95,
    priceMax: 349.95,
    inStockPriceMin: 349.95,
    inStock: true,
    categories: [],
    ...overrides,
  };
}

function stick(overrides: Partial<CatalogStick> = {}): CatalogStick {
  return {
    slug: 'grays-jb12-plus-composite',
    brand: 'Grays',
    name: 'Grays JB 12+ Composite Hockey Stick',
    discipline: 'veld',
    bow: 'lowbow',
    modelYear: 2025,
    eans: [],
    ...overrides,
  };
}

describe('isHockeyStickRow', () => {
  it('keeps field and indoor sticks', () => {
    expect(isHockeyStickRow(row())).toBe(true);
    expect(
      isHockeyStickRow(row({ merchant_product_category_path: 'Hockey > Zaalhockey', product_name: 'Osaka Pro Tour Indoor Hockeystick' })),
    ).toBe(true);
    expect(isHockeyStickRow(row({ merchant_product_category_path: 'Sport > Hockey', product_type: 'Sticks' }))).toBe(true);
  });

  it('drops balls, bags, grips, keeper sticks, other sports and the rest of the assortment', () => {
    const notSticks = [
      { product_name: 'Grays Stickbag Zwart', merchant_product_category_path: 'Hockey > Sticktassen' },
      { product_name: 'Grays Hockeybal Glad Wit', merchant_product_category_path: 'Hockey > Ballen' },
      { product_name: 'Grays Twin Grip', merchant_product_category_path: 'Hockey > Accessoires > Grips' },
      { product_name: 'Grays Goalie Stick', merchant_product_category_path: 'Hockey > Keeper' },
      { product_name: 'Bauer Ijshockey Stick', merchant_product_category_path: 'Wintersport > IJshockey > Sticks' },
      { product_name: 'Campingstoel Deluxe', merchant_product_category_path: 'Kamperen > Meubels' },
      { product_name: 'Grays Mini Stick Souvenir', merchant_product_category_path: 'Hockey > Hockeysticks' },
    ];
    for (const overrides of notSticks) expect(isHockeyStickRow(row(overrides)), overrides.product_name).toBe(false);
  });
});

describe('collectSticks', () => {
  it('merges lengths of one model, skips rows not for sale and invalid rows', () => {
    const models = collectSticks([
      row(),
      row({ 'Fashion:size': '37.5', search_price: '339.95', in_stock: '0', stock_quantity: '0', ean: '5056323712352' }),
      row({ 'Fashion:size': '35', is_for_sale: '0' }),
      row({ product_name: '', parent_product_id: 'P9' }),
      row({ product_name: 'Grays Hockeybal', merchant_product_category_path: 'Hockey > Ballen', parent_product_id: 'P8' }),
    ]);
    expect(models).toHaveLength(1);
    expect(models[0]).toMatchObject({
      url: 'https://www.plutosport.nl/grays-jb12-plus',
      sizes: ['36,5', '37,5'],
      sizesInStock: ['36,5'],
      priceMin: 339.95,
      inStockPriceMin: 349.95,
      inStock: true,
      eans: ['5056323712345', '5056323712352'],
    });
  });

  it('groups by product page when parent_product_id is missing', () => {
    const models = collectSticks([
      row({ parent_product_id: '', 'Fashion:size': '36.5' }),
      row({ parent_product_id: '', 'Fashion:size': '37.5', merchant_deep_link: 'https://www.plutosport.nl/grays-jb12-plus?size=37.5' }),
    ]);
    expect(models).toHaveLength(1);
    expect(models[0]?.sizes).toEqual(['36,5', '37,5']);
  });

  it('treats missing stock columns as unknown, not as in stock', () => {
    const [m] = collectSticks([row({ in_stock: undefined, stock_quantity: undefined, stock_status: undefined })]);
    expect(m?.inStock).toBe(false);
    const [n] = collectSticks([row({ in_stock: undefined, stock_quantity: undefined, stock_status: 'in stock' })]);
    expect(n?.inStock).toBe(true);
  });
});

describe('helpers', () => {
  it('reads collection years the way our catalog writes them', () => {
    expect(seasonYear('JDH X93TT Pro Bow 2025/26')).toBe(2025);
    expect(seasonYear('adidas Estro .60 26/27')).toBe(2026);
    expect(seasonYear('Osaka Vision 2024-2025')).toBe(2024);
    expect(seasonYear('Grays GR 2026')).toBe(2026);
    expect(seasonYear('Princess Competition 1 Star PROBOW Pi/Wh')).toBeNull();
    expect(seasonYear('Osaka Pro Tour 40 2.0')).toBeNull();
  });

  it('normalises lengths and brand names', () => {
    expect(normalSize('36.5')).toBe('36,5');
    expect(normalSize('36,5 inch')).toBe('36,5');
    expect(normalSize('37"')).toBe('37');
    expect(normalSize('M')).toBe('M');
    expect(sameBrand('Indian Maharadja', 'The Indian Maharadja')).toBe(true);
    expect(sameBrand('Csign Sports', 'Csign')).toBe(true);
    expect(sameBrand('Adidas', 'adidas')).toBe(true);
    expect(sameBrand('Grays', 'Gryphon')).toBe(false);
  });
});

describe('matchStick', () => {
  it('is sure on the same EAN, whatever the name', () => {
    const result = matchStick(stick({ eans: ['5056323712345'] }), [model({ name: 'GR JB12+ 36.5', eans: ['5056323712345'] })]);
    expect(result).toMatchObject({ level: 'zeker', method: 'ean' });
  });

  it('is sure on brand, model, bow and year written differently ("JB 12+" vs "JB12+ Jumbow 2025/26")', () => {
    expect(matchStick(stick(), [model()])).toMatchObject({ level: 'zeker', method: 'naam' });
  });

  it('reads "PB" as Pro Bow and "25/26" as 2025', () => {
    const ours = stick({ slug: 'jdh-x93-pro-bow', brand: 'JDH', name: 'JDH X93 Pro Bow', bow: 'probow', modelYear: 2025 });
    expect(matchStick(ours, [model({ brand: 'JDH', name: 'JDH X93 PB Hockeystick 25/26' })])).toMatchObject({ level: 'zeker' });
  });

  it('doubts when the shop name has extra model words ("X93TT", "DB10+")', () => {
    const jdh = stick({ slug: 'jdh-x93-pro-bow', brand: 'JDH', name: 'JDH X93 Pro Bow', bow: 'probow', modelYear: 2025 });
    const tt = matchStick(jdh, [model({ brand: 'JDH', name: 'JDH X93TT Probow Hockeystick 2025/26' })]);
    expect(tt.level).toBe('twijfel');
    expect(tt.note).toContain('tt');
    const db = stick({ slug: 'grays-db10-composite', name: 'Grays DB 10 Composite', bow: 'dynabow' });
    expect(matchStick(db, [model({ name: 'Grays DB10+ Dynabow Hockeystick 2025/26' })]).level).toBe('twijfel');
  });

  it('never matches junior with senior', () => {
    const reece = stick({ slug: 'reece-alpha-jr', brand: 'Reece', name: 'Reece Alpha JR', bow: undefined, modelYear: undefined });
    expect(matchStick(reece, [model({ brand: 'Reece', name: 'Reece Alpha Hockeystick Senior' })]).level).toBe('geen');
    const junior = matchStick(reece, [model({ brand: 'Reece', name: 'Reece Alpha Junior Hockeystick', junior: true })]);
    expect(junior.level).toBe('twijfel');
    expect(junior.note).toContain('modeljaar niet bekend');
  });

  it('does not match another bow, another discipline or another collection year', () => {
    const jdh = stick({ slug: 'jdh-x93-pro-bow', brand: 'JDH', name: 'JDH X93 Pro Bow', bow: 'probow', modelYear: 2025 });
    expect(matchStick(jdh, [model({ brand: 'JDH', name: 'JDH X93 Low Bow 2025/26' })]).level).toBe('geen');
    expect(matchStick(stick(), [model({ discipline: 'zaal' })]).level).toBe('geen');
    const older = matchStick(stick(), [model({ name: 'Grays JB12+ Jumbow Hockeystick 2024/25' })]);
    expect(older).toMatchObject({ level: 'geen' });
    expect(older.note).toContain('2024');
  });

  it('takes the bow from the specifications when the name has none, but not from a list of options', () => {
    const adidas = stick({ slug: 'adidas-estro-60-2627', brand: 'adidas', name: 'adidas Estro .60 26/27', bow: 'lowbow', modelYear: 2026 });
    const plain = { brand: 'Adidas', name: 'Adidas Estro .60 Hockeystick 2026/27' };
    expect(matchStick(adidas, [model({ ...plain, specText: 'Bow: Low Bow | Carbon: 60%' })]).level).toBe('zeker');
    expect(matchStick(adidas, [model({ ...plain, specText: 'Bow: Mid Bow' })]).level).toBe('geen');
    expect(matchStick(adidas, [model({ ...plain, specText: 'Kies uit Low Bow of Mid Bow' })]).level).toBe('twijfel');
  });

  it('doubts when the year is missing on one side', () => {
    expect(matchStick(stick({ modelYear: undefined }), [model()]).level).toBe('twijfel');
    expect(matchStick(stick(), [model({ name: 'Grays JB12+ Jumbow Hockeystick' })]).level).toBe('twijfel');
  });

  it('picks the colour variant in stock with the lowest price', () => {
    const result = matchStick(stick(), [
      model({ key: 'a', name: 'Grays JB12+ Jumbow Hockeystick 2025/26 Zwart', inStock: false, inStockPriceMin: null, priceMin: 299 }),
      model({ key: 'b', name: 'Grays JB12+ Jumbow Hockeystick 2025/26 Blauw', inStockPriceMin: 359.95 }),
      model({ key: 'c', name: 'Grays JB12+ Jumbow Hockeystick 2025/26 Rood', inStockPriceMin: 349.95 }),
    ]);
    expect(result).toMatchObject({ level: 'zeker', model: { key: 'c' } });
  });
});

describe('overlapSummary', () => {
  const sure = { slug: 'x', level: 'zeker' as const, note: '' };
  const base: OverlapRow = { slug: 'x', name: 'X', bol: 'nee', passaPrice: null, match: sure, plutoPrice: null, plutoShipping: null };

  it('counts sticks at two or more shops and the median price difference', () => {
    const rows: OverlapRow[] = [
      { ...base, slug: 'a', bol: 'ja', passaPrice: 100, plutoPrice: 90, plutoShipping: 0 },
      { ...base, slug: 'b', passaPrice: 60, plutoPrice: 70, plutoShipping: 6.95 },
      { ...base, slug: 'c', bol: 'ja' },
      { ...base, slug: 'd', passaPrice: 50, plutoPrice: 45, plutoShipping: 6.95, match: { ...sure, level: 'twijfel' } },
    ];
    const summary = overlapSummary(rows);
    expect(summary).toMatchObject({ sticks: 4, multiShopSure: 2, multiShopIfDoubtsHold: 3, priced: 2, plutoCheaper: 1 });
    expect(summary.medianDifference).toBe(10);
    expect(summary.medianDifferenceWithShipping).toBeCloseTo((10 + 16.95) / 2);
  });
});
