import { describe, expect, it } from 'vitest';
import { BOL_PARTNER_SITE_ID, RETAILERS, bolPartnerUrl } from './retailers';

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

  it('uses the site ID of jouwhockeystick.nl by default', () => {
    expect(BOL_PARTNER_SITE_ID).toBe('1547833');
  });

  it('encodes the target URL so its own query string survives', () => {
    const target = 'https://www.bol.com/nl/nl/s/?searchtext=a+b&page=2';
    const url = bolPartnerUrl(target, { subid: 'catalogus', name: 'test' });
    expect(new URL(url).searchParams.get('url')).toBe(target);
  });
});
