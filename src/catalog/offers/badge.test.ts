import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OfferRows } from '@/components/offers/OfferRows';
import { OFFER_TEXT } from '@/content/offers';
import { cardPrice, hasLowestBadge, isStrictlyLowest, sortOffers, type Offer } from './sort';

// The "Laagste prijs" badge (owner, 2026-11-05): price only, and only when it is really lower.
const now = new Date('2026-11-05T12:00:00Z');
const offer = (o: Partial<Offer> & Pick<Offer, 'retailer'>): Offer => ({
  productUrl: 'https://www.passasports.nl/x-1',
  priceEur: 200,
  shippingEur: 0,
  inStock: true,
  readAt: '2026-11-04',
  ...o,
});
const badge = (offers: Offer[], size: number | null = null) => hasLowestBadge(sortOffers(offers, { size, now }), { size, now });

describe('hasLowestBadge', () => {
  it('marks the top row when it is strictly lower than another current, in-stock price', () => {
    expect(badge([offer({ retailer: 'bolcom', priceEur: 250 }), offer({ retailer: 'passasports', priceEur: 240 })])).toBe(true);
  });

  it('no badge for one shop, a tie, or unknown shipping on the top row', () => {
    expect(badge([offer({ retailer: 'bolcom' })])).toBe(false);
    expect(badge([offer({ retailer: 'bolcom' }), offer({ retailer: 'passasports' })])).toBe(false);
    expect(badge([offer({ retailer: 'bolcom', priceEur: 150, shippingEur: null }), offer({ retailer: 'passasports' })])).toBe(false);
  });

  it('only compares current prices in stock in the chosen length', () => {
    // The other shop's price is too old, or out of stock: nothing to be lower than.
    expect(badge([offer({ retailer: 'bolcom', priceEur: 150 }), offer({ retailer: 'passasports', readAt: '2026-01-01' })])).toBe(false);
    expect(badge([offer({ retailer: 'bolcom', priceEur: 150 }), offer({ retailer: 'passasports', inStock: false })])).toBe(false);
    // In 37,5" only PassaHockey has it: the cheaper bol.com row is not the comparison.
    expect(
      badge(
        [
          offer({ retailer: 'bolcom', priceEur: 150, lengths: [36.5] }),
          offer({ retailer: 'passasports', priceEur: 200, lengths: [37.5] }),
          offer({ retailer: 'daka', priceEur: 220, lengths: [37.5] }),
        ],
        37.5,
      ),
    ).toBe(true);
  });

  it('shows the badge in the rows, once, and never a "cheapest" wording', () => {
    const html = renderToStaticMarkup(
      createElement(OfferRows, {
        brand: 'Grays',
        productName: 'Grays Test',
        placement: 'productpagina',
        offers: [
          offer({ retailer: 'bolcom', priceEur: 250, productUrl: 'https://www.bol.com/nl/nl/p/x/9300000000000001/' }),
          offer({ retailer: 'passasports', priceEur: 240 }),
        ],
        nowIso: now.toISOString(),
        visible: 2,
        detail: 'full',
      }),
    );
    expect(html.split(`>${OFFER_TEXT.lowestBadge}<`).length - 1).toBe(1);
    expect(html).not.toMatch(/goedkoopst|beste prijs|scherpste/i);
  });
});

describe('one "Laagste prijs" rule for the badge and the card (2026-11-09)', () => {
  const cardLowest = (offers: Offer[]) => {
    const price = cardPrice(offers, null, now);
    return price.kind === 'shop' && price.lowest;
  };

  it('equal, equal, higher: no badge and no card label, a tie at the top is never "laagste"', () => {
    const offers = [
      offer({ retailer: 'bolcom', priceEur: 100 }),
      offer({ retailer: 'passasports', priceEur: 100 }),
      offer({ retailer: 'daka', productUrl: 'https://www.daka.nl/p/x', priceEur: 120 }),
    ];
    expect(badge(offers)).toBe(false);
    expect(cardLowest(offers)).toBe(false);
  });

  it('lower than all others: badge and card label agree', () => {
    const offers = [
      offer({ retailer: 'bolcom', priceEur: 90 }),
      offer({ retailer: 'passasports', priceEur: 100 }),
      offer({ retailer: 'daka', productUrl: 'https://www.daka.nl/p/x', priceEur: 100 }),
    ];
    expect(badge(offers)).toBe(true);
    expect(cardLowest(offers)).toBe(true);
  });

  it('unknown shipping on the lowest, or one shop: neither', () => {
    const unknown = [offer({ retailer: 'bolcom', priceEur: 90, shippingEur: null }), offer({ retailer: 'passasports', priceEur: 100 })];
    expect(badge(unknown)).toBe(false);
    expect(cardLowest(unknown)).toBe(false);
    expect(isStrictlyLowest([offer({ retailer: 'bolcom' })])).toBe(false);
  });

  it('agree on random lists without a chosen length', () => {
    const shops = ['bolcom', 'passasports', 'plutosport'] as const;
    for (let seed = 1; seed <= 200; seed += 1) {
      const offers = shops.map((retailer, i) =>
        offer({
          retailer,
          priceEur: 90 + ((seed * (i + 3)) % 4) * 5,
          shippingEur: (seed + i) % 5 === 0 ? null : ((seed * (i + 1)) % 2) * 5,
          inStock: (seed + i) % 7 !== 0,
        }),
      );
      expect(cardLowest(offers), String(seed)).toBe(badge(offers));
    }
  });
});
