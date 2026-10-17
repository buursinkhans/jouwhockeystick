import { describe, expect, it } from 'vitest';
import {
  comparePassaFeed,
  disciplineFromCategories,
  isSameModel,
  modelTokens,
  parsePassaFeed,
  productPageUrl,
  type PassaStickModel,
} from './passaFeed';

function product({
  id,
  name,
  page,
  size,
  ean,
  price = '99.95',
  stock = '1',
  availability = 'in stock',
  categoryPaths = ['Hockey &gt; Hockeysticks &gt; Senior'],
  subcategory = 'Sticks',
  gender = 'Senior',
  brand = 'Grays',
}: {
  id: string;
  name: string;
  page: string;
  size: string;
  ean: string;
  price?: string;
  stock?: string;
  availability?: string;
  categoryPaths?: string[];
  subcategory?: string;
  gender?: string;
  brand?: string;
}): string {
  const target = encodeURIComponent(`https://www.passasports.nl/${page}?size=10342&discipline=7405`);
  return `<product ID="${id}">
<campaignID>39608</campaignID>
<name>${name}</name>
<price currency="EUR">${price}</price>
<URL>https://www.passasports.nl/tt/passa-nl/?tt=39608_2490853_517408_&amp;r=${target}</URL>
<images>
<image>https://cdn.sportshop.com/catalog/product/600/600/2/0/${id}_1.jpg</image>
</images>
<description><![CDATA[Belangrijkste kenmerken * Merk: ${brand} * Type kromming: MidBow]]></description>
<properties>
<property name="brand"><value>${brand}</value></property>
<property name="EAN"><value>${ean}</value></property>
<property name="stock"><value>${stock}</value></property>
<property name="availability"><value>${availability}</value></property>
<property name="categoryPath">${categoryPaths.map((p) => `<value>${p}</value>`).join('')}</property>
<property name="gender"><value>${gender}</value></property>
<property name="size"><value>${size}</value></property>
<property name="subcategories"><value>${subcategory}</value></property>
</properties>
<variations/>
</product>`;
}

const FEED = `<?xml version="1.0" encoding="utf-8"?>
<products>
${product({ id: '1', name: 'Grays DB 5', page: 'grays-db-5-27057', size: '36.5 inch', ean: '111', price: '90.95' })}
${product({ id: '2', name: 'Grays DB 5', page: 'grays-db-5-27057', size: '37.5 inch', ean: '112', price: '94.95', stock: '0', availability: 'out of stock' })}
${product({ id: '3', name: 'Grays DB7 Xi DynaBow', page: 'grays-db7-xi-dynabow-27073', size: '36.5 inch', ean: '113', categoryPaths: ['Hockey &gt; Zaalhockey &gt; Zaalhockey sticks'] })}
${product({ id: '4', name: 'Grays JB 6 Junior', page: 'grays-jb-6-junior-27055', size: '30 inch', ean: '114', gender: 'Junior', categoryPaths: ['Hockey &gt; Hockeysticks &gt; Junior'] })}
${product({ id: '5', name: 'Grays Stickgrip', page: 'grays-stickgrip', size: 'One Size', ean: '115', categoryPaths: ['Hockey &gt; Accessoires &gt; Stickaccessoires'] })}
${product({ id: '6', name: 'Grays GK6000', page: 'grays-gk6000', size: '36.5 inch', ean: '116', categoryPaths: ['Hockey &gt; Hockey keeper &gt; Sticks'] })}
${product({ id: '7', name: 'adidas Squadra Sweat Pant', page: 'adidas-squadra', size: 'M', ean: '117', subcategory: 'Kleding', brand: 'adidas' })}
${product({ id: '8', name: 'Indian Maharadja Red Junior', page: 'indian-maharadja-red-junior-10221065', size: '28 inch', ean: '118', gender: 'Junior', brand: 'Indian Maharadja', categoryPaths: ['Hockey &gt; Hockeysticks &gt; Junior'] })}
</products>`;

/** Test helper: the n-th parsed model, failing loudly when it is missing. */
function nth(models: PassaStickModel[], index: number): PassaStickModel {
  const model = models[index];
  if (!model) throw new Error(`no model at ${index}`);
  return model;
}

describe('productPageUrl', () => {
  it('takes the shop page out of the TradeTracker link, without size parameters', () => {
    const link =
      'https://www.passasports.nl/tt/passa-nl/?tt=39608_2490853_517408_&r=https%3A%2F%2Fwww.passasports.nl%2Fgrays-db-5-27057%3Fsize%3D10342';
    expect(productPageUrl(link)).toBe('https://www.passasports.nl/grays-db-5-27057');
  });

  it('refuses a link to another shop', () => {
    expect(productPageUrl('https://www.passasports.nl/tt/?r=https%3A%2F%2Fevil.example%2Fx')).toBeNull();
  });
});

describe('parsePassaFeed', () => {
  const models = parsePassaFeed(FEED);

  it('keeps field and indoor sticks only, one model per page with sizes merged', () => {
    expect(models.map((m) => m.name)).toEqual([
      'Grays DB 5',
      'Grays DB7 Xi DynaBow',
      'Grays JB 6 Junior',
      'Indian Maharadja Red Junior',
    ]);
    const db5 = nth(models, 0);
    expect(db5.url).toBe('https://www.passasports.nl/grays-db-5-27057');
    expect(db5.sizesInches).toEqual([36.5, 37.5]);
    expect(db5.eans).toEqual(['111', '112']);
    expect([db5.priceMin, db5.priceMax]).toEqual([90.95, 94.95]);
    expect(db5.inStock).toBe(true);
    expect(db5.discipline).toBe('veld');
    expect(nth(models, 1).discipline).toBe('zaal');
  });
});

describe('disciplineFromCategories', () => {
  it('reads indoor from the category or the name', () => {
    expect(disciplineFromCategories(['Hockey > Zaalhockey > Zaalhockey sticks'], 'TK 2')).toBe('zaal');
    expect(disciplineFromCategories(['Hockey > Cyber Monday'], 'Grays PB10 Xi ProBow')).toBe('zaal');
    expect(disciplineFromCategories(['Hockey > Hockeysticks > Senior'], 'Grays DB 5')).toBe('veld');
    expect(disciplineFromCategories(['Hockey > Cyber Monday'], 'adidas Fabela .5')).toBe('onbekend');
  });
});

describe('modelTokens', () => {
  it('writes the same model the same way across shops', () => {
    expect(modelTokens('Grays DB8 Composite', 'Grays')).toEqual(modelTokens('Grays Dynabow 8', 'Grays'));
    expect(modelTokens('Grays JB 12+ Composite Hockey Stick', 'Grays')).toEqual(['jumbow', '12', 'plus']);
    expect(modelTokens('Grays JB+ 12', 'Grays')).toEqual(['jumbow', 'plus', '12']);
    expect(modelTokens('JDH X93 Pro Bow', 'JDH')).toEqual(['x', '93', 'probow']);
    expect(modelTokens('JDH X01 Mid Bow', 'JDH')).toEqual(['x', '1', 'midbow']);
    expect(modelTokens('adidas Estro .60 26/27', 'adidas')).toEqual(['estro', '60']);
    expect(modelTokens('Princess Premium 4K 10 Star', 'Princess')).toContain('4k');
  });
});

describe('isSameModel', () => {
  const db5 = nth(parsePassaFeed(FEED), 0);
  const ours = { slug: 'grays-db5-composite', brand: 'Grays', name: 'Grays DB 5 Composite Hockey Stick', discipline: 'veld' as const };

  it('matches on brand and every model word', () => {
    expect(isSameModel(ours, db5)).toBe(true);
    expect(isSameModel({ ...ours, name: 'Grays DB 10 Composite' }, db5)).toBe(false);
    expect(isSameModel({ ...ours, brand: 'JDH' }, db5)).toBe(false);
  });

  it('does not mix field and indoor, or junior and senior', () => {
    expect(isSameModel({ ...ours, discipline: 'zaal' }, db5)).toBe(false);
    expect(isSameModel({ ...ours, name: 'Grays DB 5 Junior' }, db5)).toBe(false);
  });

  it('knows that PassaHockey writes "Indian Maharadja" without "The"', () => {
    const red = nth(parsePassaFeed(FEED), 3);
    const ourRed = {
      slug: 'indian-maharadja-red-junior',
      brand: 'The Indian Maharadja',
      name: 'The Indian Maharadja Red Jr Kinder Veldhockeystick',
      discipline: 'veld' as const,
    };
    expect(isSameModel(ourRed, red)).toBe(true);
  });
});

describe('names and colours', () => {
  const colours = `<products>
${product({ id: '9', name: 'Brabo O&amp;apos;Geez Hout Junior', page: 'brabo-ogeez-hout-junior-1', size: '28 inch', ean: '201', brand: 'Brabo', gender: 'Junior' })}
${product({ id: '10', name: 'Brabo O&amp;apos;Geez Hout Junior', page: 'brabo-ogeez-hout-junior-2', size: '30 inch', ean: '202', brand: 'Brabo', gender: 'Junior' })}
${product({ id: '11', name: 'Brabo O&amp;apos;Geez Hout Junior', page: 'brabo-ogeez-hout-junior-2', size: '32 inch', ean: '203', brand: 'Brabo', gender: 'Junior' })}
${product({ id: '12', name: 'Brabo Elite 2 Forged Carbon LowBow Indoor', page: 'brabo-elite-2-indoor', size: '36.5 inch', ean: '204', brand: 'Brabo', categoryPaths: ['Hockey &gt; Zaalhockey &gt; Zaalhockey sticks'] })}
</products>`;

  it('decodes names the feed escaped twice', () => {
    expect(nth(parsePassaFeed(colours), 0).name).toBe("Brabo O'Geez Hout Junior");
  });

  it('lists a stick with a page per colour once, and takes turns between kinds of stick', () => {
    const { gaps } = comparePassaFeed(parsePassaFeed(colours), []);
    expect(gaps.map((g) => [g.name, g.url, g.otherUrls])).toEqual([
      ["Brabo O'Geez Hout Junior", 'https://www.passasports.nl/brabo-ogeez-hout-junior-2', ['https://www.passasports.nl/brabo-ogeez-hout-junior-1']],
      ['Brabo Elite 2 Forged Carbon LowBow Indoor', 'https://www.passasports.nl/brabo-elite-2-indoor', []],
    ]);
  });
});

describe('comparePassaFeed', () => {
  const models = parsePassaFeed(FEED);

  it('checks our links, suggests new ones and lists sticks we do not have', () => {
    const result = comparePassaFeed(models, [
      { slug: 'grays-db5-composite', brand: 'Grays', name: 'Grays DB 5 Composite', discipline: 'veld' },
      {
        slug: 'grays-db7xi-composite-indoor',
        brand: 'Grays',
        name: 'Grays DB7Xi Composite Indoor',
        discipline: 'zaal',
        passaSportsProductUrl: 'https://www.passasports.nl/grays-db7-xi-dynabow-27073',
      },
      {
        slug: 'grays-gone',
        brand: 'Grays',
        name: 'Grays AC9',
        discipline: 'veld',
        passaSportsProductUrl: 'https://www.passasports.nl/grays-ac9-old',
      },
    ]);
    expect(result.linked).toEqual([
      { kind: 'ok', slug: 'grays-db7xi-composite-indoor', url: 'https://www.passasports.nl/grays-db7-xi-dynabow-27073' },
      { kind: 'niet-in-feed', slug: 'grays-gone', url: 'https://www.passasports.nl/grays-ac9-old' },
    ]);
    expect(result.suggestions.map((s) => [s.slug, s.candidates.map((c) => c.name)])).toEqual([
      ['grays-db5-composite', ['Grays DB 5']],
    ]);
    // Brands we carry come first.
    expect(result.gaps.map((g) => g.name)).toEqual(['Grays JB 6 Junior', 'Indian Maharadja Red Junior']);
  });

  it('reports a linked stick that is sold out', () => {
    const soldOut = parsePassaFeed(FEED.replaceAll('<value>in stock</value>', '<value>out of stock</value>'));
    const result = comparePassaFeed(soldOut, [
      {
        slug: 'grays-db5-composite',
        brand: 'Grays',
        name: 'Grays DB 5',
        discipline: 'veld',
        passaSportsProductUrl: 'https://www.passasports.nl/grays-db-5-27057',
      },
    ]);
    expect(result.linked[0]?.kind).toBe('uitverkocht');
    expect(result.gaps).toEqual([]);
  });
});
