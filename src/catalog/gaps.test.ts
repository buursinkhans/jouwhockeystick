import { describe, expect, it } from 'vitest';
import type { MarketSnapshot } from '../market/marketScan';
import { bolIdFromUrl, findCatalogGaps, isCovered, modelKey, significantTokens } from './gaps';

const catalog = [
  { brand: 'Scoop', name: 'Scoop Indoor Mid Bow 20% Carbon' },
  {
    brand: 'Reece',
    name: 'Reece IN-Alpha JR',
    bolProductUrl: 'https://www.bol.com/nl/nl/p/reece-in-alpha-jr-hockey-stick/9300000239590864/',
  },
];

describe('significantTokens', () => {
  it('drops sizes and shop words but keeps model numbers and carbon', () => {
    expect(significantTokens('Scoop Zaalhockeystick - Indoor - Mid Bow - 20% Carbon - 36,5 inch')).toEqual([
      'scoop', 'indoor', 'mid', 'bow', '20%', 'carbon',
    ]);
    expect(significantTokens('Grays DB 5 Hockeystick')).toEqual(['grays', 'db', '5']);
    expect(significantTokens('Grays GK8000 Ultrabow Sen Stk - maat 37.5L')).toEqual(['grays', 'gk8000', 'ultrabow']);
  });
});

describe('isCovered', () => {
  it('matches on the bol.com product id or on every word of our model name', () => {
    expect(isCovered({ title: 'Scoop Zaalhockeystick - Indoor - Mid Bow - 20% Carbon - 37,5 inch' }, catalog)).toBe(true);
    expect(isCovered({ title: 'Scoop Zaalhockeystick - Indoor - Ultra Bow - 20% Carbon' }, catalog)).toBe(false);
    expect(
      isCovered({ title: 'Iets anders', url: 'https://www.bol.com/nl/nl/p/x/9300000239590864/' }, catalog),
    ).toBe(true);
  });
});

describe('bolIdFromUrl', () => {
  it('reads the 16-digit id', () => {
    expect(bolIdFromUrl('https://www.bol.com/nl/nl/p/grays-db-5/9300000123456789/?bltgh=x')).toBe('9300000123456789');
    expect(bolIdFromUrl(undefined)).toBeNull();
  });
});

describe('modelKey', () => {
  it('merges size and colour variants', () => {
    expect(modelKey('Scoop WDN Zaalhockeystick Junior Design 2 - Mid Bow - Blue - 33 Inch')).toBe(
      modelKey('Scoop WDN Zaalhockeystick Junior Design 2 - Mid Bow - Blue - 34 Inch'),
    );
  });
});

describe('findCatalogGaps', () => {
  const snapshot: MarketSnapshot = {
    date: '2026-10-11',
    sites: [],
    bol: [
      {
        query: 'hockeystick',
        items: [
          { ean: '1', title: 'Grays DB 5 Hockeystick Oceaanblauw/Zilver', rank: 1, price: 105 },
          { ean: '2', title: 'Hockeystick 36,5” – Kunststof Straathockeystick Blauw', rank: 2, price: 16.95 },
          { ean: '3', title: 'Scoop Zaalhockeystick - Indoor - Mid Bow - 20% Carbon - 36,5 inch', rank: 3 },
        ],
      },
      {
        query: 'zaalhockeystick',
        items: [
          { ean: '4', title: 'Scoop Zaalhockeystick - Indoor - Ultra Bow - 20% Carbon - 37,5 inch', rank: 6 },
          { ean: '5', title: 'Scoop Zaalhockeystick - Indoor - Ultra Bow - 20% Carbon - 36,5 inch', rank: 9 },
        ],
      },
    ],
  };

  it('lists missing club sticks once, best rank first', () => {
    const gaps = findCatalogGaps(snapshot, catalog);
    expect(gaps.map((g) => g.ean)).toEqual(['1', '4']);
    expect(gaps[1]).toMatchObject({ bestRank: 6, variants: [expect.stringContaining('36,5 inch')] });
  });
});
