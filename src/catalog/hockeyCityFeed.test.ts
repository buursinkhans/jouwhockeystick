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
  hockeyCityShoeListings,
  hockeyCityStickMatches,
  hockeyCitySticks,
  makerEan,
  parseHockeyCityFeed,
  type HockeyCityStickModel,
} from './hockeyCityFeed';
import { getOffers } from './offers';
import { HOCKEYCITY_OFFERS } from './offers/hockeyCity';
import { HOCKEYCITY_CONFIRMED } from './offers/hockeyCityConfirmed';
import type { StickMatch } from './plutosportFeed';
import { getShoeListings, getShoes } from './shoes';

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

  it('links shoes on the maker EAN only, to the cheapest page in stock, never on a glove or an own number', () => {
    const listings = hockeyCityShoeListings(
      [
        { slug: 'asics-gel-peake-3', eans: ['4571633936296', '4570158833578'] },
        { slug: 'grays-stealth', eans: ['5261902421439'] },
      ],
      records,
      '2026-11-03',
    );
    expect(Object.keys(listings)).toEqual(['asics-gel-peake-3']);
    expect(listings['asics-gel-peake-3']).toMatchObject({
      shop: 'hockeycity',
      url: 'https://www.hockeycity.nl/gel-peake-3-sale.html',
      priceEur: 72,
      inStock: true,
      sizes: [],
      colourPages: 2,
      readAt: '2026-11-03',
    });
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
