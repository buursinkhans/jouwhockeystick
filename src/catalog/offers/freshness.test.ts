import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OfferRows } from '@/components/offers/OfferRows';
import { OFFER_TEXT } from '@/content/offers';
import { freshnessNow, type Offer } from './sort';

// Code review 2026-11-08: static pages keep the build date; the browser rechecks freshness after mount.
const built = '2026-11-08T04:05:00.000Z';
const offer = (o: Partial<Offer> & Pick<Offer, 'retailer'>): Offer => ({
  productUrl: 'https://www.passasports.nl/x-1',
  priceEur: 200,
  shippingEur: 0,
  inStock: true,
  readAt: '2026-11-06',
  ...o,
});
const offers = [
  offer({ retailer: 'daka', productUrl: 'https://www.daka.nl/p/grays-test-stick', priceEur: 150 }),
  offer({ retailer: 'passasports', priceEur: 180 }),
];
const render = (nowIso: string) =>
  renderToStaticMarkup(
    createElement(OfferRows, {
      brand: 'Grays',
      productName: 'Test',
      placement: 'productpagina',
      offers,
      nowIso,
      visible: 2,
      detail: 'full',
    }),
  );

describe('freshnessNow', () => {
  it('takes the browser date when it is later than the build', () => {
    const later = Date.parse('2026-11-25T09:00:00Z');
    expect(freshnessNow(built, later).getTime()).toBe(later);
  });

  it('keeps the build date when the browser clock is behind, so it can never show more', () => {
    expect(freshnessNow(built, Date.parse('2026-11-01T00:00:00Z')).toISOString()).toBe(built);
    expect(freshnessNow(built, Date.parse(built)).toISOString()).toBe(built);
  });

  it('falls back to the browser date when the build date is not valid', () => {
    expect(freshnessNow('onbekend', 1_000).getTime()).toBe(1_000);
  });
});

describe('OfferRows with the browser date', () => {
  it('renders like the server on the build date: amounts and the badge', () => {
    const html = render(built);
    expect(html).toContain('€150,00');
    expect(html).toContain(OFFER_TEXT.lowestBadge);
  });

  it('hides amounts and the badge once the browser date is more than 14 days after the read date', () => {
    const browser = freshnessNow(built, Date.parse('2026-11-21T12:00:00Z')).toISOString();
    const html = render(browser);
    expect(html).not.toContain('€150,00');
    expect(html).not.toContain('€180,00');
    expect(html).not.toContain(OFFER_TEXT.lowestBadge);
    expect(html).toContain('Bekijk prijs bij Daka');
  });

  it('still shows the amounts on day 14', () => {
    const browser = freshnessNow(built, Date.parse('2026-11-20T20:00:00Z')).toISOString();
    expect(render(browser)).toContain('€150,00');
  });
});
