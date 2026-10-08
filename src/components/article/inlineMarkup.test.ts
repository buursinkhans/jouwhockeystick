import { describe, expect, it } from 'vitest';
import { parseInline } from './inlineMarkup';

describe('parseInline', () => {
  it('returns plain text unchanged', () => {
    expect(parseInline('Gewoon tekst.')).toEqual([
      { kind: 'text', text: 'Gewoon tekst.' },
    ]);
  });

  it('parses bold, italic and links in order', () => {
    expect(
      parseInline(
        '**Tip:** lees *dit* eerst [Bron: X](https://example.com/a).',
      ),
    ).toEqual([
      { kind: 'strong', text: 'Tip:' },
      { kind: 'text', text: ' lees ' },
      { kind: 'em', text: 'dit' },
      { kind: 'text', text: ' eerst ' },
      { kind: 'link', text: 'Bron: X', href: 'https://example.com/a' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('ignores links that are not http(s)', () => {
    expect(parseInline('[x](javascript:alert(1))')).toEqual([
      { kind: 'text', text: '[x](javascript:alert(1))' },
    ]);
  });

  it('parses site-internal links', () => {
    expect(parseInline('Doe de [stickwijzer](/stickwijzer).')).toEqual([
      { kind: 'text', text: 'Doe de ' },
      { kind: 'link', text: 'stickwijzer', href: '/stickwijzer' },
      { kind: 'text', text: '.' },
    ]);
  });
});
