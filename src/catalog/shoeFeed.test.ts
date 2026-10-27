import { describe, expect, it } from 'vitest';
import {
  PlutoShoeCollector,
  isHockeyShoe,
  normalShoeSize,
  parsePassaShoes,
  shoeDiscipline,
  shoeOverlap,
  summarizeShoes,
} from './shoeFeed';

function passaProduct(o: { name: string; price: number; r: string; path: string; sub: string; size?: string; stock?: number; ean?: string; gender?: string }) {
  const prop = (name: string, value: string | undefined) =>
    value === undefined ? '' : `<property name="${name}"><value>${value}</value></property>`;
  return `<product><name>${o.name}</name><price>${o.price}</price><URL>https://tc.tradetracker.net/?c=1&amp;r=${encodeURIComponent(o.r)}</URL><description>x</description><properties>${prop('categoryPath', o.path)}${prop('subcategories', o.sub)}${prop('brand', o.name.split(' ')[0])}${prop('size', o.size)}${prop('availability', o.stock ? 'in stock' : 'out of stock')}${prop('stock', String(o.stock ?? 0))}${prop('EAN', o.ean)}${prop('gender', o.gender)}</properties></product>`;
}

describe('isHockeyShoe', () => {
  it('keeps hockey shoes and drops sticks, socks, keeper gear and other sports', () => {
    expect(isHockeyShoe(['Hockey > Schoenen'], 'Adidas Hockey Youngstar')).toBe(true);
    expect(isHockeyShoe(['Sport > Schoenen'], 'Asics Gel-Hockey Typhoon')).toBe(true);
    expect(isHockeyShoe(['Hockey > Sticks'], 'Grays GR7000')).toBe(false);
    expect(isHockeyShoe(['Hockey > Kleding'], 'Hockeysokken Brabo')).toBe(false);
    expect(isHockeyShoe(['Hockey > Keeper'], 'Keeper schoen overshoe')).toBe(false);
    expect(isHockeyShoe(['IJshockey > Schaatsen'], 'Bauer schoen')).toBe(false);
    expect(isHockeyShoe(['Hockey > Accessoires'], 'Hockey handschoen Osaka')).toBe(false);
    expect(isHockeyShoe(['Hardlopen > Schoenen'], 'Nike Pegasus')).toBe(false);
  });

  it('calls a shoe indoor from the category or the name', () => {
    expect(shoeDiscipline(['Hockey > Zaalhockey > Schoenen'], 'Brabo Tribute')).toBe('zaal');
    expect(shoeDiscipline(['Hockey > Schoenen'], 'Brabo Tribute Indoor')).toBe('zaal');
    expect(shoeDiscipline(['Hockey > Schoenen'], 'Brabo Tribute')).toBe('veld');
  });
});

describe('normalShoeSize', () => {
  it('normalises EU sizes and keeps other formats', () => {
    expect(normalShoeSize('38')).toBe('38');
    expect(normalShoeSize('38.5')).toBe('38,5');
    expect(normalShoeSize('EU 40,0')).toBe('40');
    expect(normalShoeSize('42 2/3')).toBe('42 2/3');
    expect(normalShoeSize('UK 6')).toBe('UK 6');
    expect(normalShoeSize('99')).toBeNull();
    expect(normalShoeSize('')).toBeNull();
  });
});

describe('parsePassaShoes', () => {
  it('merges sizes per product page and ignores sticks', () => {
    const xml = [
      passaProduct({ name: 'Adidas Fabela Zone', price: 89.95, r: '/adidas-fabela-zone-1?size=40', path: 'Hockey > Hockeyschoenen', sub: 'Schoenen', size: '40', stock: 2, ean: '4066' + '000000001' }),
      passaProduct({ name: 'Adidas Fabela Zone', price: 79.95, r: '/adidas-fabela-zone-1?size=38', path: 'Hockey > Hockeyschoenen', sub: 'Schoenen', size: '38', stock: 0 }),
      passaProduct({ name: 'Brabo Tribute Indoor Junior', price: 49.95, r: '/brabo-tribute-indoor-jr', path: 'Hockey > Zaalhockey > Schoenen', sub: 'Schoenen', size: '33', stock: 1, gender: 'Junior' }),
      passaProduct({ name: 'Grays GR7000', price: 199, r: '/grays-gr7000', path: 'Hockey > Hockeysticks', sub: 'Sticks', size: '36.5 inch', stock: 3 }),
    ].join('');
    const shoes = parsePassaShoes(`<products>${xml}</products>`);
    expect(shoes).toHaveLength(2);
    const fabela = shoes.find((s) => s.name === 'Adidas Fabela Zone');
    expect(fabela).toMatchObject({ discipline: 'veld', sizes: ['38', '40'], priceMin: 79.95, priceMax: 89.95, inStock: true, hasEan: true, junior: false });
    expect(shoes.find((s) => s.name.startsWith('Brabo'))).toMatchObject({ discipline: 'zaal', junior: true });
  });
});

describe('PlutoShoeCollector', () => {
  const row = (o: Record<string, string>) => ({
    product_name: 'Asics Gel-Hockey Typhoon 4',
    merchant_deep_link: 'https://www.plutosport.nl/asics-gel-hockey-typhoon-4?x=1',
    merchant_product_category_path: 'Hockey > Hockeyschoenen',
    brand_name: 'Asics',
    search_price: '99.95',
    currency: 'EUR',
    in_stock: '1',
    ...o,
  });

  it('keeps Dutch, for-sale hockey shoes and merges their sizes', () => {
    const c = new PlutoShoeCollector();
    c.add(row({ merchant_product_id: '123_42' }));
    c.add(row({ merchant_product_id: '123_43 1/3', search_price: '89.95', in_stock: '0' }));
    c.add(row({ merchant_deep_link: 'https://www.plutosport.de/asics-gel-hockey-typhoon-4' }));
    c.add(row({ is_for_sale: '0', merchant_deep_link: 'https://www.plutosport.nl/other' }));
    c.add(row({ product_name: 'Grays GR5000', merchant_product_category_path: 'Hockey > Hockeysticks', merchant_deep_link: 'https://www.plutosport.nl/grays' }));
    const shoes = c.result();
    expect(c.rows).toBe(5);
    expect(shoes).toHaveLength(1);
    expect(shoes[0]).toMatchObject({ shop: 'Plutosport', sizes: ['42', '43 1/3'], priceMin: 89.95, priceMax: 99.95, inStock: true });
  });
});

describe('summarizeShoes and shoeOverlap', () => {
  const base = { shop: 'Plutosport' as const, sizes: [], hasEan: false, categories: ['Hockey > Schoenen'], junior: false };
  const models = [
    { ...base, url: 'a', name: 'Adidas Fabela Zone', brand: 'Adidas', discipline: 'veld' as const, priceMin: 60, priceMax: 60, inStock: true },
    { ...base, url: 'b', name: 'Asics Typhoon', brand: 'Asics', discipline: 'veld' as const, priceMin: 100, priceMax: 100, inStock: true },
    { ...base, url: 'c', name: 'Brabo Tribute Indoor', brand: 'Brabo', discipline: 'zaal' as const, priceMin: 80, priceMax: 80, inStock: true, junior: true },
    { ...base, url: 'd', name: 'Adidas Hockey Lux', brand: 'Adidas', discipline: 'veld' as const, priceMin: 140, priceMax: 140, inStock: false },
  ];

  it('counts disciplines, brands and in-stock price quartiles', () => {
    const s = summarizeShoes(models);
    expect(s).toMatchObject({ models: 4, inStock: 3, veld: 3, zaal: 1, junior: 1 });
    expect(s.brands[0]).toEqual({ brand: 'Adidas', models: 2 });
    expect(s.price).toEqual({ p25: 70, median: 80, p75: 90, min: 60, max: 100 });
    expect(s.categories).toEqual([{ text: 'Hockey > Schoenen', models: 4 }]);
  });

  it('finds the same model at both shops on brand and name', () => {
    const passa = [{ ...models[0]!, shop: 'PassaHockey' as const, name: 'adidas  Fabela-Zone', url: 'p' }];
    expect(shoeOverlap(passa, models)).toBe(1);
  });
});
