import { describe, expect, it } from 'vitest';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { shippingCostEur, BOL_SHIPPING, PASSASPORTS_SHIPPING, PLUTOSPORT_SHIPPING } from '@/lib/retailers';
import { getOffers, isPriceFresh, lowestTotal, sortOffers, totalPrice, type Offer } from './index';

const now = new Date('2026-10-27T12:00:00Z');

function offer(overrides: Partial<Offer>): Offer {
  return {
    retailer: 'bolcom',
    productUrl: 'https://www.bol.com/nl/nl/p/x/1/',
    priceEur: 100,
    shippingEur: 0,
    inStock: true,
    readAt: '2026-10-27',
    ...overrides,
  };
}

const order = (offers: Offer[], size: number | null = null) => sortOffers(offers, { size, now }).map((o) => o.retailer);

describe('sortOffers', () => {
  it('sorts on price plus shipping, not on price alone', () => {
    expect(
      order([
        offer({ retailer: 'bolcom', priceEur: 120, shippingEur: 0 }),
        offer({ retailer: 'plutosport', priceEur: 115, shippingEur: 6.95 }),
        offer({ retailer: 'passasports', priceEur: 118, shippingEur: 0 }),
      ]),
    ).toEqual(['passasports', 'bolcom', 'plutosport']);
  });

  it('puts shops without a price, or with a price older than 14 days, last', () => {
    expect(
      order([
        offer({ retailer: 'bolcom', priceEur: null, readAt: null }),
        offer({ retailer: 'passasports', priceEur: 50, readAt: '2026-10-01' }),
        offer({ retailer: 'plutosport', priceEur: 200 }),
      ]),
    ).toEqual(['plutosport', 'passasports', 'bolcom']);
  });

  it('puts a shop without the chosen length below the shops that have it, even when it is cheaper', () => {
    const offers = [
      offer({ retailer: 'plutosport', priceEur: 90, lengths: [36, 37.5] }),
      offer({ retailer: 'passasports', priceEur: 110, lengths: [36.5, 37.5] }),
    ];
    expect(order(offers, 36.5)).toEqual(['passasports', 'plutosport']);
    expect(order(offers, 37.5)).toEqual(['plutosport', 'passasports']);
    expect(order(offers, null)).toEqual(['plutosport', 'passasports']);
  });

  it('treats unknown lengths as available and out-of-stock shops as without the length', () => {
    expect(
      order([
        offer({ retailer: 'passasports', priceEur: 80, inStock: false }),
        offer({ retailer: 'bolcom', priceEur: 100 }),
      ], 36.5),
    ).toEqual(['bolcom', 'passasports']);
  });

  it('on an equal total takes the price read most recently, then the name', () => {
    expect(
      order([
        offer({ retailer: 'plutosport', priceEur: 100, readAt: '2026-10-20' }),
        offer({ retailer: 'passasports', priceEur: 100, readAt: '2026-10-27' }),
        offer({ retailer: 'bolcom', priceEur: 100, readAt: '2026-10-27' }),
      ]),
    ).toEqual(['bolcom', 'passasports', 'plutosport']);
  });
});

describe('prices', () => {
  it('counts a price as current for 14 days', () => {
    expect(isPriceFresh(offer({ readAt: '2026-10-13' }), now)).toBe(true);
    expect(isPriceFresh(offer({ readAt: '2026-10-12' }), now)).toBe(false);
    expect(isPriceFresh(offer({ priceEur: null, readAt: null }), now)).toBe(false);
  });

  it('adds shipping to the total and takes the lowest total in the chosen length', () => {
    expect(totalPrice(offer({ priceEur: 119.95, shippingEur: 5.95 }))).toBeCloseTo(125.9);
    const offers = [offer({ priceEur: 60, shippingEur: 3.95, lengths: [36] }), offer({ priceEur: 70, shippingEur: 0 })];
    expect(lowestTotal(offers, { size: 36, now })).toBeCloseTo(63.95);
    expect(lowestTotal(offers, { size: 37.5, now })).toBe(70);
    expect(lowestTotal([], { size: null, now })).toBeNull();
  });

  it('applies each shop’s public shipping terms', () => {
    expect(shippingCostEur(PASSASPORTS_SHIPPING, 20)).toBe(5.95);
    expect(shippingCostEur(PASSASPORTS_SHIPPING, 79)).toBe(3.95);
    expect(shippingCostEur(PASSASPORTS_SHIPPING, 79.95)).toBe(0);
    expect(shippingCostEur(PLUTOSPORT_SHIPPING, 74.95)).toBe(6.95);
    expect(shippingCostEur(PLUTOSPORT_SHIPPING, 75)).toBe(0);
    expect(shippingCostEur(BOL_SHIPPING, 24.95)).toBeNull();
    expect(shippingCostEur(BOL_SHIPPING, 25)).toBe(0);
  });
});

describe('getOffers', () => {
  it('only offers confirmed shop pages: no bol.com search, no Plutosport without a match', () => {
    for (const product of getAllProducts(new Date(), { includeImported: true })) {
      for (const o of getOffers(product)) {
        if (o.retailer === 'bolcom') expect(o.productUrl.startsWith('https://www.bol.com/nl/nl/p/'), product.slug).toBe(true);
        if (o.retailer === 'plutosport') expect(product.plutosportProductUrl, product.slug).toBe(o.productUrl);
        if (o.priceEur !== null) expect(o.readAt, product.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('gives an imported PassaHockey stick its feed price and lengths', () => {
    const imported = getAllProducts(new Date(), { includeImported: true }).find((p) => p.feedImport?.feed === 'passahockey');
    expect(imported).toBeDefined();
    const passa = getOffers(imported!).find((o) => o.retailer === 'passasports');
    expect(passa).toMatchObject({ priceEur: imported!.priceIndicativeEur.value, lengths: imported!.lengthsInches.value, inStock: true });
  });

  it('never offers a shop for a stick it does not sell', () => {
    const grays = getProductBySlug('grays-db8-composite');
    expect(grays && getOffers(grays).some((o) => o.retailer === 'plutosport')).toBe(false);
  });
});
