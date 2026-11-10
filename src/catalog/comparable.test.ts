import { describe, expect, it } from 'vitest';
import { pricedOffers, pricedShoes } from './comparable';
import type { Offer } from './offers';
import type { Shoe } from './shoes/types';

const now = new Date('2026-11-10T12:00:00Z');
const offer = (over: Partial<Offer> = {}): Offer => ({
  retailer: 'bolcom',
  productUrl: 'https://www.bol.com/nl/nl/p/x/1/',
  priceEur: 50,
  shippingEur: 0,
  inStock: true,
  readAt: '2026-11-09',
  ...over,
});

describe('pricedOffers', () => {
  it('keeps only current prices of items in stock', () => {
    const offers = [
      offer(),
      offer({ retailer: 'daka', inStock: false }),
      offer({ retailer: 'hockeycity', priceEur: null, readAt: null }),
      offer({ retailer: 'plutosport', readAt: '2026-10-01' }),
    ];
    expect(pricedOffers(offers, now).map((o) => o.retailer)).toEqual(['bolcom']);
  });
});

describe('pricedShoes', () => {
  const shoe = (slug: string, brand: string, model: string) => ({ slug, brand, model }) as unknown as Shoe;
  it('shows only priced shoes, one per brand, most shops first', () => {
    const shoes = [shoe('a', 'Adidas', 'A'), shoe('b', 'Adidas', 'B'), shoe('c', 'Asics', 'C'), shoe('d', 'Grays', 'D')];
    const offers: Record<string, Offer[]> = {
      a: [offer()],
      b: [offer(), offer({ retailer: 'daka' })],
      c: [offer()],
      d: [offer({ readAt: '2026-09-01' })],
    };
    expect(pricedShoes(shoes, now, 3, (s) => offers[s.slug] ?? []).map((s) => s.slug)).toEqual(['b', 'c']);
  });
});
