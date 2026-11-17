import { describe, expect, it } from 'vitest';
import { EDITORIAL_AUTHOR, authorJsonLd, jsonLdHtml } from './jsonLd';

describe('jsonLdHtml', () => {
  it('cannot close the script tag, whatever the data contains', () => {
    const html = jsonLdHtml({
      name: 'Stick </script><script>alert(1)</script>',
    });
    expect(html).not.toContain('</script>');
    expect(html).not.toContain('<');
  });

  it('stays the same JSON for anyone who parses it', () => {
    const data = { name: 'Grays <JB 10> & co', price: 290.95 };
    expect(JSON.parse(jsonLdHtml(data))).toEqual(data);
  });
});

describe('authorJsonLd (2026-11-17)', () => {
  it('marks the editorial team as an organisation and a named author as a person with a link to /over-ons', () => {
    expect(authorJsonLd(EDITORIAL_AUTHOR)).toEqual({ '@type': 'Organization', name: 'Redactie jouwhockeystick.nl' });
    expect(authorJsonLd('Hans Buursink')).toEqual({ '@type': 'Person', name: 'Hans Buursink', url: 'https://jouwhockeystick.nl/over-ons' });
  });
});
