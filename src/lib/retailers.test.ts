import { describe, expect, it } from 'vitest';
import { RETAILERS } from './retailers';
import { brandSchema, type Brand } from '@/catalog/types';

describe('bol.com retailer', () => {
  it('always includes "hockeystick" in the search text, even for ambiguous model names', () => {
    const url = RETAILERS.bolcom.getUrl({
      productName: 'JDH X93 Pro Bow',
      brand: 'JDH',
    });
    expect(url).not.toBeNull();
    const searchText = new URL(url!).searchParams.get('searchtext');
    expect(searchText).toContain('hockeystick');
    expect(searchText).toContain('JDH X93 Pro Bow');
  });

  it('builds a valid bol.com search URL', () => {
    const url = RETAILERS.bolcom.getUrl({
      productName: 'Grays JB 10 Composite Hockey Stick',
      brand: 'Grays',
    });
    expect(url?.startsWith('https://www.bol.com/nl/nl/s/?')).toBe(true);
  });
});

describe('PassaSports retailer', () => {
  const allBrands = brandSchema.options;

  it('has a verified category URL for every brand currently in the catalog', () => {
    for (const brand of allBrands as Brand[]) {
      const url = RETAILERS.passasports.getUrl({
        productName: 'irrelevant',
        brand,
      });
      expect(url, `expected a PassaSports URL for ${brand}`).not.toBeNull();
      expect(url).toMatch(
        /^https:\/\/www\.passasports\.nl\/hockey\/hockeysticks\//,
      );
    }
  });

  it('never fabricates a URL for a brand it has no verified slug for', () => {
    // JDH's slug intentionally does not follow the brand-name pattern, so
    // this guards against ever silently falling back to a guessed slug.
    const url = RETAILERS.passasports.getUrl({
      productName: 'irrelevant',
      brand: 'JDH',
    });
    expect(url).not.toBe('https://www.passasports.nl/hockey/hockeysticks/jdh');
  });
});
