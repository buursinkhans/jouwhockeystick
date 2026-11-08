import { describe, expect, it } from 'vitest';
import { sizeStockLine } from '@/content/offers';
import { sizeStock, type Offer } from './sort';

// UX phase 4 (decision log 2026-11-08): stock in the advised length, from the feeds, never a delivery promise.
const now = new Date('2026-11-08T12:00:00Z');
const offer = (o: Partial<Offer> & Pick<Offer, 'retailer'>): Offer => ({
  productUrl: 'https://www.passasports.nl/x-1',
  priceEur: 200,
  shippingEur: 0,
  inStock: true,
  readAt: '2026-11-06',
  ...o,
});
const line = (offers: Offer[], size = 36.5) => sizeStockLine(sizeStock(offers, { size, now }), size);

describe('sizeStock', () => {
  it('counts only current, in-stock feeds that list the length', () => {
    const stock = sizeStock(
      [
        offer({ retailer: 'passasports', lengths: [36.5, 37.5] }),
        offer({ retailer: 'daka', lengths: [37.5] }),
        offer({ retailer: 'hockeycity' }),
        offer({ retailer: 'plutosport', lengths: [36.5], readAt: '2026-10-01' }),
        offer({ retailer: 'bolcom', inStock: false, lengths: [36.5] }),
      ],
      { size: 36.5, now },
    );
    expect(stock).toEqual({ inSize: 1, unknown: 1, stocked: 3, total: 5, readAt: ['2026-11-06'] });
  });
});

describe('sizeStockLine', () => {
  it('names the length, how many shops and the read date', () => {
    expect(
      line([offer({ retailer: 'passasports', lengths: [36.5] }), offer({ retailer: 'daka', lengths: [37.5] })]),
    ).toEqual({ tone: 'yes', text: '36,5" op voorraad bij 1 van 2 winkels volgens hun feeds, gelezen op 6 nov' });
    expect(line([offer({ retailer: 'daka', lengths: [36.5] }), offer({ retailer: 'plutosport', lengths: [36.5] })])!.text).toBe(
      '36,5" op voorraad bij alle 2 winkels volgens hun feeds, gelezen op 6 nov',
    );
    expect(line([offer({ retailer: 'daka', lengths: [36.5] })])!.text).toBe(
      '36,5" op voorraad volgens de feed van de winkel, gelezen op 6 nov',
    );
  });

  it('says so honestly when the feeds do not list the length, and is empty without current stock', () => {
    expect(line([offer({ retailer: 'hockeycity' })])!.tone).toBe('unknown');
    expect(line([offer({ retailer: 'daka', lengths: [37.5] })])!.tone).toBe('none');
    expect(line([offer({ retailer: 'daka', lengths: [36.5], readAt: '2026-10-01' })])).toBeNull();
    expect(line([])).toBeNull();
  });

  it('never promises delivery or a best deal', () => {
    const texts = [
      line([offer({ retailer: 'daka', lengths: [36.5] })]),
      line([offer({ retailer: 'hockeycity' })]),
      line([offer({ retailer: 'daka', lengths: [37.5] })]),
    ].map((l) => l!.text);
    for (const text of texts) {
      expect(text).not.toMatch(/morgen|vandaag|in huis|geleverd|levertijd|goedkoopst|beste prijs|!/i);
      expect(text).not.toMatch(/[–—]/);
    }
  });
});
