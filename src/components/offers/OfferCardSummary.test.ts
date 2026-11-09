import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Offer } from '@/catalog/offers/sort';
import { OFFER_TEXT } from '@/content/offers';
import { OfferCardSummary } from './OfferCardSummary';

// Product card bottom (2026-11-05): the comparison first, the shop second, no claims the data does not carry.
const today = new Date().toISOString().slice(0, 10);
const offer = (o: Partial<Offer> & Pick<Offer, 'retailer'>): Offer => ({
  productUrl: `https://example.com/${o.retailer}`,
  priceEur: 200,
  shippingEur: 0,
  inStock: true,
  readAt: today,
  ...o,
});
// Real shop pages, so RetailerLink builds a link.
const BOL = { retailer: 'bolcom' as const, productUrl: 'https://www.bol.com/nl/nl/p/x/9300000000000001/' };
const PASSA = { retailer: 'passasports' as const, productUrl: 'https://www.passasports.nl/x-1' };
const DAKA = { retailer: 'daka' as const, productUrl: 'https://www.daka.nl/p/x-sku_1' };

const render = (offers: Offer[], indicativeEur: number | null = 180) =>
  renderToStaticMarkup(
    createElement(OfferCardSummary, {
      brand: 'Grays',
      productName: 'Grays Test',
      placement: 'catalogus',
      offers,
      compareHref: '/sticks/x',
      indicativeEur,
    }),
  );

describe('OfferCardSummary', () => {
  it('shows the lowest total incl. shipping, the shop count, compare as main action and the shop of that price', () => {
    const html = render([
      offer({ ...BOL, priceEur: 260 }),
      offer({ ...PASSA, priceEur: 250 }),
      offer({ ...DAKA, priceEur: 240, shippingEur: 4.95 }),
    ]);
    expect(html).toContain(OFFER_TEXT.cardLowest);
    expect(html).toContain('3 winkels');
    expect(html).toContain('€244,95');
    expect(html).toContain('incl. €4,95 verzending · bij Daka');
    expect(html).toContain(OFFER_TEXT.cardCompareShops);
    expect(html).toContain(OFFER_TEXT.cardLowest);
    expect(html).toContain('href="/sticks/x"');
    expect(html).toMatch(/Direct naar (<!-- -->)?Daka/);
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).toContain(OFFER_TEXT.cardPartnerNote);
  });

  it('with one shop: no comparison, one button to that shop', () => {
    const html = render([offer({ ...PASSA })]);
    expect(html).toContain('1 winkel');
    expect(html).not.toContain(OFFER_TEXT.cardCompareShops);
    expect(html).toMatch(/Bekijk bij (<!-- -->)?PassaHockey/);
    expect(html).toContain('gratis verzending · bij PassaHockey');
    expect(html).toContain('Alleen bij PassaHockey gevonden');
  });

  it('calls a price "Laagste prijs" only with something to compare (2026-11-09)', () => {
    const label = (html: string) => (html.includes(`>${OFFER_TEXT.cardLowest}<`) ? 'lowest' : html.includes(`>${OFFER_TEXT.cardPrice}<`) ? 'price' : 'other');
    expect(label(render([offer({ ...PASSA })]))).toBe('price');
    // Two shops, but only one with a current price in stock.
    expect(label(render([offer({ ...PASSA }), offer({ ...BOL, inStock: false })]))).toBe('price');
    // Unknown shipping on the lowest: no "laagste" claim.
    expect(label(render([offer({ ...BOL, priceEur: 100, shippingEur: null }), offer({ ...PASSA, priceEur: 300 })]))).toBe('price');
    expect(label(render([offer({ ...BOL, priceEur: 100 }), offer({ ...PASSA, priceEur: 300 })]))).toBe('lowest');
  });

  it('never says shipping is included when it is unknown', () => {
    const html = render([offer({ ...BOL, shippingEur: null }), offer({ ...PASSA, priceEur: 300 })]);
    expect(html).toContain('verzendkosten onbekend · bij bol.com');
    expect(html).not.toMatch(/incl\. verzending|gratis verzending/);
  });

  it('skips a shop that is out of stock or has an old price for the lowest price', () => {
    const html = render([
      offer({ ...BOL, priceEur: 100, inStock: false }),
      offer({ ...DAKA, priceEur: 90, readAt: '2020-01-01' }),
      offer({ ...PASSA, priceEur: 150 }),
    ]);
    expect(html).toContain('€150,00');
    expect(html).toContain('bij PassaHockey');
  });

  it('without a current price: the indicative price, marked as such; without shops no buttons', () => {
    const stale = render([offer({ ...BOL, readAt: '2020-01-01' })]);
    expect(stale).toContain(`>${OFFER_TEXT.cardIndicative}<`);
    expect(stale).toContain('€180,00');
    expect(stale).toContain(OFFER_TEXT.cardNoCurrentPrice);
    const none = render([]);
    expect(none).toContain(OFFER_TEXT.cardNoShop);
    expect(none).not.toContain(OFFER_TEXT.cardCompareShops);
    expect(none).not.toContain(OFFER_TEXT.cardPartnerNote);
  });

  it('never claims cheapest, best price or a discount', () => {
    const html = render([offer({ ...BOL, priceEur: 260 }), offer({ ...PASSA, priceEur: 250 })]);
    expect(html).not.toMatch(/goedkoopst|beste prijs|<s>|line-through|% korting/i);
  });
});
