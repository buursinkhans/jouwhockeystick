import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import {
  HOCKEYCITY_SHIPPING,
  RETAILERS,
  hockeyCityTrackingUrl,
  isHockeyCityProductPage,
  shippingCostEur,
} from '@/lib/retailers';
import {
  asImportModel,
  hockeyCityShoeModel,
  hockeyCityStickMatches,
  hockeyCitySticks,
  isHockeyCityShoe,
  lengthInches,
  makerEan,
  parseHockeyCityFeed,
  parseHockeyCityPage,
  stickStock,
  type HockeyCityStickModel,
} from './hockeyCityFeed';
import { getOffers } from './offers';
import { HOCKEYCITY_OFFERS } from './offers/hockeyCity';
import { HOCKEYCITY_CONFIRMED } from './offers/hockeyCityConfirmed';
import type { StickMatch } from './plutosportFeed';
import { HOCKEYCITY_IMPORT, toFeedProduct } from './plutosportImport';
import { getShoeListings, getShoes } from './shoes';
import { buildShoeImport, modelKey } from './shoes/feedImport';

/** HockeyCity integration (decision log 2026-11-03). */

const item = (name: string, path: string, category: string, gtin: string, mpn: string, availability = 'in stock', price = '65.00') =>
  `<product ID="1"><campaignID>27931</campaignID><name>${name}</name><price currency="EUR">${price}</price>` +
  `<URL>https://www.hockeycity.nl/tracking/tradetracker/redirect/?tt=27931_1633756_517408_&amp;r=https%3A%2F%2Fwww.hockeycity.nl%2F${path}%3Fsource%3Dgooglebase</URL>` +
  `<images><image>https://cdn.webshopapp.com/shops/273290/files/1/image1.jpg</image></images><description><![CDATA[]]></description><categories/>` +
  `<properties><property name="categoryPath"><value>${category}</value></property><property name="availability"><value>${availability}</value></property>` +
  `<property name="fromPrice"><value>90.00</value></property><property name="brand"><value>${name.startsWith('The Indian Maharadja') ? 'The Indian Maharadja' : name.split(' ')[0]}</value></property>` +
  `<property name="GTIN"><value>${gtin}</value></property><property name="MPN"><value>${mpn}</value></property></properties><variations/></product>`;

const FEED = `<?xml version="1.0" encoding="utf-8"?><products>
${item('The Indian Maharadja Gold 95 Lowbow NXT', 'gold-95-lowbow-nxt.html', 'Hockeysticks &gt; Veldhockeysticks \n &gt; Indian Maharadja', '5261902473582', '10261046-36.5')}
${item('Brabo O&#039;GEEZ Original Pink/White JR', 'ogeez-original-pink-white-jr.html', 'Hockeysticks &gt; Veldhockeysticks &gt; Brabo', '5261902438802', '315.55310.040-30', 'out of stock')}
${item('Osaka Indoor Pro Bow 10', 'indoor-pro-bow-10.html', 'Hockeysticks &gt; Zaalhockeysticks &gt; Osaka', '5261902447415', 'STK00252-36.5')}
${item('Ritual Reflex 75 (GK)', 'reflex-75-gk.html', 'Hockeysticks &gt; Veldhockeysticks &gt; Ritual', '5261902461381', 'RS-RF-36-26')}
${item('Asics Gel Peake 3', 'gel-peake-3.html', 'Hockeyschoenen &gt; Veldhockeyschoenen', '4571633936296', '1113A057-108-4.5', 'in stock', '120.00')}
${item('Asics Gel-Peake 3', 'gel-peake-3-sale.html', 'Hockeyschoenen &gt; Veldhockeyschoenen', '4570158833578', '1113A057-400-5', 'in stock', '72.00')}
${item('Osaka Armadillo Glove', 'armadillo-glove.html', 'Hockeyschoenen &gt; Veldhockeyschoenen', '4571633936296', 'ACC00024-Grey-L')}
${item('Grays Stealth White 26', 'stealth-white-26.html', 'Hockeyschoenen &gt; Zaalhockeyschoenen', '5261902421439', '6763607-28')}
</products>`;

describe('HockeyCity tracking link and shipping', () => {
  it('builds the TradeTracker redirect of the feed, with our placement as reference', () => {
    const url = hockeyCityTrackingUrl('https://www.hockeycity.nl/estro-75.html', 'stickwijzer');
    expect(url).toBe(
      'https://www.hockeycity.nl/tracking/tradetracker/redirect/?tt=27931_1633756_517408_stickwijzer&r=https%3A%2F%2Fwww.hockeycity.nl%2Festro-75.html',
    );
    // "_" separates the parts of tt.
    expect(hockeyCityTrackingUrl('https://www.hockeycity.nl/estro-75.html', 'a_b')).toContain('tt=27931_1633756_517408_a-b');
    expect(RETAILERS.hockeycity.getUrl({ productName: 'x', brand: 'adidas', placement: 'productpagina' })).toBeNull();
  });

  it('links only to product pages on hockeycity.nl, never a search, category or other shop', () => {
    expect(hockeyCityTrackingUrl('https://www.hockeycity.nl/search/estro', 'x')).toBeNull();
    expect(hockeyCityTrackingUrl('https://www.hockeycity.nl/estro-75.html?source=googlebase', 'x')).toBeNull();
    expect(hockeyCityTrackingUrl('https://www.plutosport.nl/estro-75.html', 'x')).toBeNull();
    expect(hockeyCityTrackingUrl('niet een url', 'x')).toBeNull();
    expect(isHockeyCityProductPage(new URL('https://www.hockeycity.nl/hockeysticks/'))).toBe(false);
  });

  it('charges €5 below €100 and nothing from €100, with source and date', () => {
    expect(shippingCostEur(HOCKEYCITY_SHIPPING, 99.99)).toBe(5);
    expect(shippingCostEur(HOCKEYCITY_SHIPPING, 100)).toBe(0);
    expect(HOCKEYCITY_SHIPPING.sourceUrl).toMatch(/^https:\/\/www\.hockeycity\.nl\//);
    expect(HOCKEYCITY_SHIPPING.checkedAt).toBe('2026-11-03');
  });
});

describe('HockeyCity feed', () => {
  const records = parseHockeyCityFeed(FEED);

  it('reads the product page without the feed query, the current price and the stock', () => {
    expect(records).toHaveLength(8);
    expect(records[1]).toMatchObject({
      url: 'https://www.hockeycity.nl/ogeez-original-pink-white-jr.html',
      name: "Brabo O'GEEZ Original Pink/White JR",
      priceEur: 65,
      inStock: false,
    });
    // HockeyCity's own numbers are no EAN; the maker's are.
    expect(records[0]!.ean).toBeUndefined();
    expect(records[4]!.ean).toBe('4571633936296');
    expect(makerEan('5261902438802')).toBeUndefined();
    expect(makerEan('4069987802874')).toBe('4069987802874');
    expect(makerEan('')).toBeUndefined();
  });

  it('keeps player sticks, with field or indoor, junior and the Indian Maharadja year from the article code', () => {
    const sticks = hockeyCitySticks(records);
    expect(sticks.map((s) => s.name)).toEqual([
      'The Indian Maharadja Gold 95 Lowbow NXT',
      "Brabo O'GEEZ Original Pink/White JR",
      'Osaka Indoor Pro Bow 10',
    ]);
    expect(sticks[0]).toMatchObject({ discipline: 'veld', junior: false, year: 2026, eans: [], inStockPriceMin: 65 });
    expect(sticks[1]).toMatchObject({ junior: true, inStock: false, inStockPriceMin: null });
    expect(sticks[1]!.year).toBeUndefined();
    expect(sticks[2]!.discipline).toBe('zaal');
  });

  it('gives a stick a button only for a sure or hand-confirmed match to a page in stock', () => {
    const sticks = hockeyCitySticks(records);
    const [gold, ogeez, indoor] = sticks as [HockeyCityStickModel, HockeyCityStickModel, HockeyCityStickModel];
    const match = (slug: string, level: StickMatch['level'], model?: HockeyCityStickModel): { slug: string; match: StickMatch<HockeyCityStickModel> } => ({
      slug,
      match: { slug, level, ...(model && { model, method: 'naam' as const }), note: '' },
    });
    const result = hockeyCityStickMatches(
      [
        match('gold', 'zeker', gold),
        match('ogeez', 'zeker', ogeez),
        match('indoor', 'twijfel', indoor),
        match('bevestigd', 'geen'),
        match('bevestigd-uitverkocht', 'zeker', gold),
      ],
      records,
      {
        bevestigd: 'https://www.hockeycity.nl/indoor-pro-bow-10.html',
        'bevestigd-uitverkocht': 'https://www.hockeycity.nl/ogeez-original-pink-white-jr.html',
      },
    );
    expect(result).toEqual({
      gold: { productUrl: 'https://www.hockeycity.nl/gold-95-lowbow-nxt.html', method: 'naam', priceEur: 65 },
      bevestigd: { productUrl: 'https://www.hockeycity.nl/indoor-pro-bow-10.html', method: 'handmatig', priceEur: 65 },
    });
  });

  it('keeps hockey shoes, never a glove in the shoe category', () => {
    expect(records.filter(isHockeyCityShoe).map((r) => r.name)).toEqual([
      'Asics Gel Peake 3',
      'Asics Gel-Peake 3',
      'Grays Stealth White 26',
    ]);
  });
});

/** Phase 2: lengths and sizes from the product pages, and what only HockeyCity sells. */
describe('HockeyCity product pages', () => {
  const records = parseHockeyCityFeed(FEED);
  const page =(variants: Record<string, unknown>) => ({ product: { id: 1, variants } });
  const variant = (title: string, available: boolean, price: number, ean = '') => ({
    title,
    ean,
    active: true,
    price: { price_incl: price },
    stock: { available },
  });

  it('reads the variants, and nothing from data it does not recognise', () => {
    expect(parseHockeyCityPage(page({ a: variant('36.5', true, 230, '5261902447248'), b: variant('37.5', false, 230) }))).toEqual([
      { title: '36.5', priceEur: 230, inStock: true },
      { title: '37.5', priceEur: 230, inStock: false },
    ]);
    // `active` is only the variant the page shows first: an inactive size in stock still counts.
    expect(parseHockeyCityPage(page({ a: { ...variant('39', true, 52.5), active: false } }))).toEqual([
      { title: '39', priceEur: 52.5, inStock: true },
    ]);
    expect(parseHockeyCityPage({ product: {} })).toBeNull();
    expect(parseHockeyCityPage('<html>')).toBeNull();
  });

  it('takes the stick lengths in stock and the lowest price of those', () => {
    expect([lengthInches('36.5'), lengthInches('36,5'), lengthInches('SR 37.5'), lengthInches('28'), lengthInches('L'), lengthInches('120')]).toEqual([
      36.5, 36.5, 37.5, 28, null, null,
    ]);
    const variants = parseHockeyCityPage(
      page({ a: variant('36.5', true, 80), b: variant('37.5', true, 75), c: variant('38.5', false, 60), d: variant('Grip', true, 5) }),
    )!;
    expect(stickStock(variants)).toEqual({ lengths: [36.5, 37.5], priceEur: 75 });
    expect(stickStock([])).toEqual({ lengths: [], priceEur: null });
  });

  it('gives a shoe its EU sizes, stock per size and the maker EAN of every size', () => {
    const record = records.find((r) => r.url.endsWith('/gel-peake-3.html'))!;
    const variants = parseHockeyCityPage(
      page({
        a: variant('37', false, 120, '4570158833431'),
        b: variant('37.5', true, 120, '4570158833578'),
        c: variant('36 2/3', true, 110, '4069987883194'),
        d: variant('UK 8', true, 120, '4570158833999'),
      }),
    );
    const model = hockeyCityShoeModel(record, variants);
    expect(model).toMatchObject({
      shop: 'HockeyCity',
      discipline: 'veld',
      sizes: ['36 2/3', '37', '37,5'],
      sizesInStock: ['36 2/3', '37,5'],
      priceMin: 110,
      inStock: true,
      categories: ['Hockeyschoenen > Veldhockeyschoenen'],
    });
    expect(model.eans).toEqual(['4069987883194', '4570158833431', '4570158833578', '4570158833999', '4571633936296']);
    expect(model.junior).toBe(false);
    // Without page data: only what the feed says.
    expect(hockeyCityShoeModel(record, null)).toMatchObject({ sizes: [], inStock: true, eans: ['4571633936296'] });
    // A kids' line without "JR" in the name is junior by its sizes.
    const kids = hockeyCityShoeModel(record, parseHockeyCityPage(page({ a: variant('32', true, 45), b: variant('35 1/3', true, 45) })));
    expect(kids.junior).toBe(true);
  });

  it('cleans a repeated brand from a name and keeps a shoe dryer out of the shoes', () => {
    const extra = parseHockeyCityFeed(
      `<products>${item('Brabo Brabo G-Force Trad. Carbon 70 LowBow JR', 'g-force-70.html', 'Hockeysticks &gt; Veldhockeysticks', '5261902440000', '315.1-34')}${item('Brabo Mister Dry Black', 'mister-dry-black.html', 'Hockeyschoenen &gt; Veldhockeyschoenen', '5261902436761', '317.10050.010')}</products>`,
    );
    expect(extra[0]!.name).toBe('Brabo G-Force Trad. Carbon 70 LowBow JR');
    expect(isHockeyCityShoe(extra[1]!)).toBe(false);
  });

  it('links a shoe on EAN, imports one only HockeyCity sells, and never one that only shares a name', () => {
    const shoes = records.filter(isHockeyCityShoe).map((r) => hockeyCityShoeModel(r, null));
    const known = [{ slug: 'asics-gel-peake-3', eans: ['4571633936296'] }];
    const result = buildShoeImport({ passa: [], pluto: [], hockeyCity: shoes }, known, '2026-11-03');
    // Both Gel-Peake colour pages are one model; one of them has a known EAN, so both list under it.
    expect(result.curatedMatched).toEqual(['asics-gel-peake-3']);
    expect(result.listings['asics-gel-peake-3']).toMatchObject([{ shop: 'hockeycity', colourPages: 2, priceEur: 72 }]);
    // The Grays shoe has only HockeyCity's own numbers and no other shop: imported on its own.
    expect(result.shoes.map((s) => s.slug)).toEqual(['grays-stealth-white-26']);
    const own = result.shoes[0]!;
    expect(own.feedImport).toEqual({ feeds: ['hockeycity'], importedAt: '2026-11-03' });
    expect(own.hockeyCityProductUrl).toBe('https://www.hockeycity.nl/stealth-white-26.html');
    expect(own.category).toMatchObject({ value: 'zaal', source: 'partner-shop' });
    expect(own.eans).toEqual([]);
    // When we already show a Grays Stealth White 26 from another shop, it is not imported: no EAN, no link.
    const twice = buildShoeImport(
      { passa: [], pluto: [], hockeyCity: shoes },
      known,
      '2026-11-03',
      new Set([modelKey({ name: 'Grays Stealth White 26', brand: 'Grays' })]),
    );
    expect(twice.shoes).toEqual([]);
    expect(twice.hockeyCityNameOnly.map((s) => s.name)).toEqual(['Grays Stealth White 26']);
  });

  it('turns a stick only HockeyCity sells into a noindex feed product with its lengths in stock', () => {
    const [gold] = hockeyCitySticks(records) as [HockeyCityStickModel];
    const result = toFeedProduct(asImportModel(gold, { lengths: [36.5, 37.5], priceEur: 275 }), '2026-11-03', HOCKEYCITY_IMPORT);
    if (!('product' in result)) throw new Error(result.skip.reason);
    expect(result.product).toMatchObject({
      slug: 'the-indian-maharadja-gold-95-lowbow-nxt',
      feedImport: { feed: 'hockeycity', importedAt: '2026-11-03' },
      hockeyCityProductUrl: 'https://www.hockeycity.nl/gold-95-lowbow-nxt.html',
      lengthsInches: { value: [36.5, 37.5], source: 'partner-shop' },
      priceIndicativeEur: { value: 275 },
    });
    expect(result.product.plutosportProductUrl).toBeUndefined();
    expect(JSON.stringify(result.product)).not.toMatch(/Plutosport/);
    // Without lengths in stock nothing is imported.
    expect(toFeedProduct(asImportModel(gold, { lengths: [], priceEur: null }), '2026-11-03', HOCKEYCITY_IMPORT)).toHaveProperty('skip');
  });
});

describe('HockeyCity in the catalog and "Waar te koop"', () => {
  it('only holds product pages on hockeycity.nl, and confirmed matches are pages too', () => {
    for (const match of Object.values(HOCKEYCITY_OFFERS.sticks)) {
      expect(isHockeyCityProductPage(new URL(match.productUrl)), match.productUrl).toBe(true);
      expect(match.priceEur).toBeGreaterThan(0);
    }
    for (const url of Object.values(HOCKEYCITY_CONFIRMED)) expect(isHockeyCityProductPage(new URL(url)), url).toBe(true);
    for (const listing of Object.values(HOCKEYCITY_OFFERS.shoes)) expect(listing.shop).toBe('hockeycity');
  });

  it('shows a matched stick with its HockeyCity price and shipping, and no other stick', () => {
    const products = getAllProducts(new Date(), { includeImported: true });
    for (const product of products) {
      const offer = getOffers(product).find((o) => o.retailer === 'hockeycity');
      if (product.feedImport?.feed === 'hockeycity') {
        // Only at HockeyCity: its own price and lengths, read on the import date.
        expect(offer).toMatchObject({
          priceEur: product.priceIndicativeEur.value,
          lengths: product.lengthsInches.value,
          readAt: product.feedImport.importedAt,
        });
        expect(getOffers(product).map((o) => o.retailer)).toEqual(['hockeycity']);
        continue;
      }
      const match = HOCKEYCITY_OFFERS.sticks[product.slug];
      if (!match) {
        expect(offer, product.slug).toBeUndefined();
        continue;
      }
      expect(product.hockeyCityProductUrl).toBe(match.productUrl);
      expect(offer).toMatchObject({
        productUrl: match.productUrl,
        priceEur: match.priceEur,
        shippingEur: shippingCostEur(HOCKEYCITY_SHIPPING, match.priceEur),
        readAt: HOCKEYCITY_OFFERS.date,
      });
    }
  });

  it('gives a shoe model its HockeyCity listing, under the checked model when the feed model is hidden', () => {
    const visible = new Set(getShoes({ includeImported: true }).map((shoe) => shoe.slug));
    for (const slug of Object.keys(HOCKEYCITY_OFFERS.shoes)) {
      // A feed model that is a checked one is hidden and passes its listings on (shoes/index.ts).
      if (visible.has(slug)) expect(getShoeListings(slug).filter((l) => l.shop === 'hockeycity'), slug).toHaveLength(1);
      else expect(getShoeListings(slug), slug).toEqual([]);
    }
    const shown = [...visible].filter((slug) => getShoeListings(slug).some((l) => l.shop === 'hockeycity'));
    expect(shown.length).toBeLessThanOrEqual(Object.keys(HOCKEYCITY_OFFERS.shoes).length);
    expect(shown.length > 0).toBe(Object.keys(HOCKEYCITY_OFFERS.shoes).length > 0);
  });
});
