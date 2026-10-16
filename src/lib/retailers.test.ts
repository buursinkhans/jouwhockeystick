import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { isPassaSportsOnly } from '@/catalog/shop';
import {
  BOL_PARTNER_SITE_ID,
  RETAILERS,
  bolPartnerUrl,
  passaSportsTrackingUrl,
} from './retailers';

/** The bol.com page a partner link eventually lands on. */
function bolTarget(url: string): URL {
  const partner = new URL(url);
  return new URL(partner.searchParams.get('url') ?? '');
}

describe('bol.com retailer', () => {
  it('always includes "hockeystick" in the search text, even for ambiguous model names', () => {
    const url = RETAILERS.bolcom.getUrl({
      productName: 'JDH X93 Pro Bow',
      brand: 'JDH',
      placement: 'productpagina',
    });
    expect(url).not.toBeNull();
    const searchText = bolTarget(url!).searchParams.get('searchtext');
    expect(searchText).toContain('hockeystick');
    expect(searchText).toContain('JDH X93 Pro Bow');
  });

  it('wraps the bol.com search in a Partnerprogramma link with site ID and sub-ID', () => {
    const url = RETAILERS.bolcom.getUrl({
      productName: 'Grays JB 10 Composite Hockey Stick',
      brand: 'Grays',
      placement: 'stickwijzer',
    });
    const partner = new URL(url!);

    expect(partner.origin + partner.pathname).toBe(
      'https://partner.bol.com/click/click',
    );
    expect(Object.fromEntries(partner.searchParams)).toMatchObject({
      t: 'url',
      s: BOL_PARTNER_SITE_ID,
      f: 'TXL',
      subid: 'stickwijzer',
      name: 'Grays JB 10 Composite Hockey Stick',
    });
    expect(
      bolTarget(url!).href.startsWith('https://www.bol.com/nl/nl/s/?'),
    ).toBe(true);
  });

  it('links straight to the product page when one is known', () => {
    const productUrl =
      'https://www.bol.com/nl/nl/p/tk-maxi-junior-hockeystick/9300000226850913/';
    const url = RETAILERS.bolcom.getUrl({
      productName: 'TK Maxi Junior',
      brand: 'TK',
      placement: 'productpagina',
      productUrl,
    });
    const partner = new URL(url!);
    expect(partner.searchParams.get('url')).toBe(productUrl);
    expect(partner.searchParams.get('subid')).toBe('productpagina');
  });

  it('uses the site ID of jouwhockeystick.nl by default', () => {
    expect(BOL_PARTNER_SITE_ID).toBe('1547833');
  });

  it('encodes the target URL so its own query string survives', () => {
    const target = 'https://www.bol.com/nl/nl/s/?searchtext=a+b&page=2';
    const url = bolPartnerUrl(target, { subid: 'catalogus', name: 'test' });
    expect(new URL(url).searchParams.get('url')).toBe(target);
  });
});

const PASSA_PREFIX =
  'https://www.passasports.nl/tt/passa-nl/?tt=39608_12_517408_productpagina&r=%2F';

describe('PassaSports retailer (TradeTracker)', () => {
  it('builds exactly the link the TradeTracker generator gave us', () => {
    expect(
      passaSportsTrackingUrl(
        'https://www.passasports.nl/malik-lowbow-2-ma25101',
        'productpagina',
      ),
    ).toBe(
      'https://www.passasports.nl/tt/passa-nl/?tt=39608_12_517408_productpagina&r=%2Fmalik-lowbow-2-ma25101',
    );
  });

  it('only links to PassaSports product pages, never a search or another site', () => {
    const base = {
      productName: 'X',
      brand: 'Malik',
      placement: 'stickwijzer',
    } as const;
    expect(RETAILERS.passasports.getUrl(base)).toBeNull();
    expect(
      RETAILERS.passasports.getUrl({
        ...base,
        productUrl: 'https://www.bol.com/nl/nl/p/x/1/',
      }),
    ).toBeNull();
  });

  it('gives every PassaSports-only stick a working partner link', () => {
    const passaOnly = getAllProducts().filter(isPassaSportsOnly);
    expect(passaOnly.length).toBeGreaterThan(0);
    for (const product of passaOnly) {
      const url = RETAILERS.passasports.getUrl({
        productName: product.name,
        brand: product.brand,
        placement: 'productpagina',
        productUrl: product.passaSportsProductUrl,
      });
      expect(url?.startsWith(PASSA_PREFIX), product.slug).toBe(true);
    }
  });
});
