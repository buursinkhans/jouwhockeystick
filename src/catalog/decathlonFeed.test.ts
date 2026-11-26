import { describe, expect, it } from 'vitest';
import { DECATHLON_ODYSSEY, DECATHLON_SHIPPING, RETAILERS, decathlonTrackingUrl, isDecathlonProductPage, shippingCostEur } from '@/lib/retailers';
import {
  decathlonImportModel,
  decathlonPageUrl,
  decathlonStickMatches,
  decathlonSticks,
  groupByPage,
  isDecathlonStick,
  parseDecathlonFeed,
  stickModelName,
  stockState,
} from './decathlonFeed';
import { carbonFromText } from './plutosportImport';
import type { StickMatch } from './plutosportFeed';

// DEMO — GEEN WERKELIJKE DATA: synthetic rows in the shape of the feed read on 2026-11-26.
const SPORT = '?utm_source=Odyssey_Partnerships&amp;utm_medium=affiliate&amp;utm_campaign=2715';
const row = (over: Record<string, string> = {}) => {
  const f = {
    productURL: `https://www.decathlon.nl/p/hockeystick-youngstar-10-voor-kinderen-blauw-rood/375081/m9055975${SPORT}`,
    imageURL: 'https://contents.mediadecathlon.com/p3176340/picture.jpg',
    price: '39.99',
    categoryPath: 'Hockey&gt;Hockeysticks&gt;Hockeysticks per merk&gt;adidas hockeystick',
    size: '31"',
    deliveryCosts: '3.95',
    EAN: '5056494462270',
    name: 'Hockeystick youngstar 10 voor kinderen blauw/rood',
    description: 'Deze hockeystick is ontworpen voor jonge kinderen',
    brand: 'Adidas',
    stock: '',
    ...over,
  };
  return `<product>${Object.entries(f).map(([k, v]) => `<${k}>${v}</${k}>`).join('')}</product>`;
};
const FEED = `<?xml version="1.0"?><products>${[
  row(),
  row({ size: '32"', EAN: '5056494462287' }),
  row({ size: '33"', EAN: '5056494462294', stock: '0' }),
  row({
    productURL: `https://www.decathlon.nl/p/hockeystick-voor-volwassenen-experts-low-bow-85percent-carbon-carbotec-c85-goud-zwart/337506/c336m8827875${SPORT}`,
    name: 'Hockeystick voor volwassenen experts low bow 85% carbon carbotec c85 goud/zwart',
    brand: 'Dita',
    price: '119.99',
    categoryPath: 'Hockey&gt;Hockeysticks&gt;Hockeysticks per merk&gt;Dita hockeystick',
    size: '36,5"',
    EAN: '3583787114773',
    stock: 'in stock',
  }),
  row({
    productURL: `https://www.decathlon.nl/p/sticktas-voor-hockey-kinderen-fh500-medium-formaat-zwart-blauw-stick-gt32/308920/c382c237m8606352${SPORT}`,
    name: 'Sticktas voor hockey kinderen fh500',
    brand: 'Korok',
    categoryPath: 'Hockey&gt;Hockey accessoires&gt;Hockeytassen',
    size: '30 LITRES',
  }),
  row({
    productURL: `https://www.decathlon.nl/p/hockeyschoenen-stealth-1-0-zwart-oranje/373967/m8970360${SPORT}`,
    name: 'Hockeyschoenen stealth 1.0 zwart/oranje',
    brand: 'Grays',
    categoryPath: 'Hockey&gt;Hockeyschoenen&gt;Hockeyschoenen per merk',
    size: '41',
  }),
].join('')}</products>`;
const rows = parseDecathlonFeed(FEED);

describe('parseDecathlonFeed', () => {
  it('leest elke productregel met prijs en een echte productpagina', () => {
    expect(rows).toHaveLength(6);
    expect(rows[0]).toMatchObject({ title: 'Hockeystick youngstar 10 voor kinderen blauw/rood', brand: 'adidas', size: '31"', priceEur: 39.99, ean: '5056494462270', deliveryCostsEur: 3.95 });
  });
  it('haalt de UTM-tags uit de pagina-URL en decodeert de categorie', () => {
    expect(rows[0]?.url).toBe('https://www.decathlon.nl/p/hockeystick-youngstar-10-voor-kinderen-blauw-rood/375081/m9055975');
    expect(rows[0]?.categoryPath).toBe('Hockey>Hockeysticks>Hockeysticks per merk>adidas hockeystick');
  });
  it('slaat een regel zonder prijs of met een andere pagina dan een product over', () => {
    expect(parseDecathlonFeed(row({ price: '' }))).toEqual([]);
    expect(parseDecathlonFeed(row({ productURL: 'https://www.decathlon.nl/zoeken?q=stick' }))).toEqual([]);
    expect(parseDecathlonFeed(row({ productURL: 'https://www.example.com/p/x/1/2' }))).toEqual([]);
  });
  it('neemt een EAN alleen over als het 8 tot 14 cijfers zijn', () => {
    expect(parseDecathlonFeed(row({ EAN: 'abc' }))[0]?.ean).toBeUndefined();
  });
});

describe('decathlonPageUrl', () => {
  it('geeft de pagina zonder query en geen search- of categoriepagina', () => {
    expect(decathlonPageUrl(`https://www.decathlon.nl/p/x-y/1/2?utm_source=a`)).toBe('https://www.decathlon.nl/p/x-y/1/2');
    expect(decathlonPageUrl('https://www.decathlon.nl/c/hockey')).toBeNull();
    expect(decathlonPageUrl('nonsense')).toBeNull();
  });
});

describe('stockState', () => {
  it('leest een getal, "geen voorraad" en tekst; een leeg veld zegt niets', () => {
    expect(stockState('')).toEqual({ inStock: true, stated: false });
    expect(stockState('0')).toEqual({ inStock: false, stated: true });
    expect(stockState('5')).toEqual({ inStock: true, stated: true });
    expect(stockState('out of stock')).toEqual({ inStock: false, stated: true });
    expect(stockState('Uitverkocht')).toEqual({ inStock: false, stated: true });
    expect(stockState('in stock')).toEqual({ inStock: true, stated: true });
  });
});

describe('stokken herkennen', () => {
  const pages = groupByPage(rows);
  it('groepeert de regels per pagina', () => {
    expect(pages).toHaveLength(4);
    expect(pages[0]).toHaveLength(3);
  });
  it('een stick staat in de stickcategorie en heeft een lengte in inches', () => {
    expect(pages.filter(isDecathlonStick)).toHaveLength(2);
  });
  it('een sticktas, schoenen en een keeperstick zijn geen speler-stick', () => {
    expect(isDecathlonStick(parseDecathlonFeed(row({ categoryPath: 'Hockey&gt;Hockey accessoires&gt;Hockeytassen' })))).toBe(false);
    expect(isDecathlonStick(parseDecathlonFeed(row({ name: 'Hockeystick keeper kinderen' })))).toBe(false);
    expect(isDecathlonStick(parseDecathlonFeed(row({ size: '30 LITRES' })))).toBe(false);
  });
  it('de generieke eerste woorden van de naam vallen weg', () => {
    expect(stickModelName('Hockeystick youngstar 10 voor kinderen')).toBe('youngstar 10 voor kinderen');
    expect(stickModelName('Zaalhockeystick x')).toBe('x');
    expect(stickModelName('Kipsta fh500')).toBe('Kipsta fh500');
    expect(stickModelName('Hockeystick voor volwassenen experts low bow 85% carbon c85 goud/zwart')).toBe('low bow 85% carbon c85 goud/zwart');
    expect(stickModelName('Hockeystick voor kinderen youngstar 10')).toBe('youngstar 10');
  });
});

describe('decathlonSticks', () => {
  const sticks = decathlonSticks(rows);
  const [kid, adult] = sticks;
  it('maakt van de regels van één pagina één model met merk en naam', () => {
    expect(sticks).toHaveLength(2);
    expect(kid).toMatchObject({ name: 'adidas youngstar 10 voor kinderen blauw/rood', brand: 'adidas', discipline: 'veld', junior: true });
    expect(adult?.name).toBe('Dita low bow 85% carbon carbotec c85 goud/zwart');
    expect(decathlonSticks(parseDecathlonFeed(row({ name: 'Hockeystick osaka pro tough 3', brand: 'Osaka', size: '36,5"' })))[0]?.name).toBe('Osaka pro tough 3');
  });
  it('de import leest het carbonpercentage uit de titel (niet het niveau op prijs)', () => {
    const model = decathlonImportModel(adult as NonNullable<typeof adult>);
    expect(carbonFromText(`${model.specText} | ${model.description}`)).toBe(85);
    expect(decathlonImportModel(kid as NonNullable<typeof kid>).description).toBe('Deze hockeystick is ontworpen voor jonge kinderen');
  });
  it('telt alleen lengtes die niet uitverkocht zijn en de laagste prijs daarvan', () => {
    expect(kid?.lengths).toEqual([31, 32]); // 33" has stock 0
    expect(kid?.inStockPriceMin).toBe(39.99);
    expect(kid?.inStock).toBe(true);
    expect(adult?.lengths).toEqual([36.5]);
  });
  it('bewaart de EAN\'s van alle regels en de verzendkosten als ze gelijk zijn', () => {
    expect(kid?.eans).toEqual(['5056494462270', '5056494462287', '5056494462294']);
    expect(kid?.deliveryCostsEur).toBe(3.95);
  });
  it('weet of de feed iets over voorraad zegt', () => {
    expect(kid?.stockStated).toBe(true); // one row says 0
    expect(decathlonSticks(parseDecathlonFeed(row()))[0]?.stockStated).toBe(false);
  });
  it('een pagina waar alles uitverkocht is, is geen aanbod', () => {
    const gone = decathlonSticks(parseDecathlonFeed(row({ stock: '0' })));
    expect(gone[0]?.inStock).toBe(false);
    expect(gone[0]?.inStockPriceMin).toBeNull();
  });
  it('indoor in de naam maakt het een zaalstick; anders veld', () => {
    expect(decathlonSticks(parseDecathlonFeed(row({ name: 'Zaalhockeystick indoor 100 volwassenen', size: '36,5"' })))[0]?.discipline).toBe('zaal');
  });
});

describe('decathlonStickMatches', () => {
  const sticks = decathlonSticks(rows);
  const [kid, adult] = sticks as [(typeof sticks)[number], (typeof sticks)[number]];
  const zeker = (model: typeof kid, method: 'ean' | 'naam'): StickMatch<typeof kid> => ({ slug: 'x', level: 'zeker', method, model, note: '' });
  it('een zekere koppeling op EAN of naam geeft een knop met prijs en lengtes', () => {
    const result = decathlonStickMatches(
      [{ slug: 'a', match: zeker(kid, 'ean') }, { slug: 'b', match: zeker(adult, 'naam') }],
      sticks,
      {},
    );
    expect(result.a).toEqual({ productUrl: kid.url, method: 'ean', priceEur: 39.99, lengths: [31, 32] });
    expect(result.b?.method).toBe('naam');
  });
  it('een twijfel geeft nooit een knop', () => {
    const doubt: StickMatch<typeof kid> = { slug: 'c', level: 'twijfel', method: 'naam', model: kid, note: 'x' };
    expect(decathlonStickMatches([{ slug: 'c', match: doubt }], sticks, {})).toEqual({});
  });
  it('een handmatig bevestigde pagina gaat voor en krijgt methode handmatig', () => {
    const result = decathlonStickMatches([{ slug: 'a', match: zeker(adult, 'ean') }], sticks, { a: kid.url });
    expect(result.a).toMatchObject({ productUrl: kid.url, method: 'handmatig' });
  });
  it('een afgewezen stick, of een bevestigde pagina die niet meer leverbaar is, krijgt niets', () => {
    expect(decathlonStickMatches([{ slug: 'a', match: zeker(kid, 'ean') }], sticks, {}, new Set(['a']))).toEqual({});
    const sold = decathlonSticks(parseDecathlonFeed(row({ stock: '0' })));
    expect(decathlonStickMatches([{ slug: 'a', match: zeker(kid, 'ean') }], sold, { a: kid.url })).toEqual({});
  });
});

describe('links en verzendkosten (Odyssey)', () => {
  const page = 'https://www.decathlon.nl/p/hockeystick-youngstar-10-voor-kinderen-blauw-rood/375081/m9055975';
  it('een productpagina krijgt de UTM-tags van de URL Builder, met de plek als utm_content', () => {
    const url = new URL(decathlonTrackingUrl(page, 'productpagina') as string);
    expect(url.origin + url.pathname).toBe(page);
    expect(url.searchParams.get('utm_source')).toBe('Odyssey_Partnerships');
    expect(url.searchParams.get('utm_medium')).toBe('affiliate');
    expect(url.searchParams.get('utm_campaign')).toBe(DECATHLON_ODYSSEY.campaign);
    expect(url.searchParams.get('utm_content')).toBe('productpagina');
  });
  it('de volgorde van de tags is die van de feed en de URL Builder', () => {
    expect(decathlonTrackingUrl(page, 'stickwijzer')).toBe(`${page}?utm_source=Odyssey_Partnerships&utm_medium=affiliate&utm_campaign=2715&utm_content=stickwijzer`);
  });
  it('alleen een echte productpagina: geen zoekpagina, andere winkel of een pagina met een query', () => {
    expect(isDecathlonProductPage(new URL(page))).toBe(true);
    expect(isDecathlonProductPage(new URL('https://www.decathlon.nl/p/x-y/1'))).toBe(true);
    expect(isDecathlonProductPage(new URL('https://www.decathlon.nl/zoeken?q=stick'))).toBe(false);
    expect(isDecathlonProductPage(new URL(`${page}?utm_source=x`))).toBe(false);
    expect(isDecathlonProductPage(new URL('https://www.daka.nl/p/x-y/1/2'))).toBe(false);
    expect(decathlonTrackingUrl('https://example.com/p/x/1/2', 'stickwijzer')).toBeNull();
    expect(decathlonTrackingUrl('niet een url', 'stickwijzer')).toBeNull();
  });
  it('de winkel staat in de lijst met partners en maakt alleen een directe productlink', () => {
    const shop = RETAILERS.decathlon;
    expect(shop.label).toBe('Decathlon');
    expect(shop.getUrl({ placement: 'productpagina', productUrl: page, productName: 'x', brand: 'adidas' })).toBe(decathlonTrackingUrl(page, 'productpagina'));
    expect(shop.getUrl({ placement: 'productpagina', productName: 'x', brand: 'adidas' })).toBeNull();
  });
  it('verzending is altijd €3,95: een totaal is nooit te laag, we nemen geen Member aan', () => {
    expect(shippingCostEur(DECATHLON_SHIPPING, 39.99)).toBe(3.95);
    expect(shippingCostEur(DECATHLON_SHIPPING, 250)).toBe(3.95);
    expect(DECATHLON_SHIPPING.note).toContain('Members');
    expect(DECATHLON_SHIPPING.checkedAt).toBe('2026-11-26');
  });
});
