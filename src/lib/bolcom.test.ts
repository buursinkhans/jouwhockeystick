import { describe, expect, it } from 'vitest';
import { getBolComSearchUrl } from './bolcom';

describe('getBolComSearchUrl', () => {
  it('always includes "hockeystick" in the search text, even for ambiguous model names', () => {
    const url = getBolComSearchUrl('JDH X93 Pro Bow');
    const searchText = new URL(url).searchParams.get('searchtext');
    expect(searchText).toContain('hockeystick');
    expect(searchText).toContain('JDH X93 Pro Bow');
  });

  it('builds a valid bol.com search URL', () => {
    const url = getBolComSearchUrl('Grays JB 10 Composite Hockey Stick');
    expect(url.startsWith('https://www.bol.com/nl/nl/s/?')).toBe(true);
  });
});
