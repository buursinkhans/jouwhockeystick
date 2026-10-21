import { describe, expect, it } from 'vitest';
import { jsonLdHtml } from './jsonLd';

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
