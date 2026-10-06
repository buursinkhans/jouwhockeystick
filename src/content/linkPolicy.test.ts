import { describe, expect, it } from 'vitest';
import { sourceLinkRel } from './linkPolicy';

describe('sourceLinkRel', () => {
  it('adds nofollow to other shops, including subdomains', () => {
    expect(sourceLinkRel('https://intersport.nl/blogs/hockey/x')).toContain(
      'nofollow',
    );
    expect(
      sourceLinkRel('https://www.hockeydirect.nl/zaalhockeyadvies'),
    ).toContain('nofollow');
  });

  it('follows manufacturers and rule bodies normally', () => {
    expect(
      sourceLinkRel('https://www.grays-hockey.com/products/x'),
    ).not.toContain('nofollow');
    expect(sourceLinkRel('https://www.fih.hockey/rules')).not.toContain(
      'nofollow',
    );
  });

  it('does not match look-alike hosts', () => {
    expect(sourceLinkRel('https://notintersport.nl/')).not.toContain(
      'nofollow',
    );
  });
});
