import { describe, expect, it } from 'vitest';
import { BRAND_PROFILES } from './brands';

/** Shops and other third parties: never a source for what a brand thinks. */
const NOT_BRAND_HOSTS = [
  'bol.com',
  'passasports.nl',
  'hockeydirect',
  'hockeystyle.nl',
  'knhb.nl',
  'hockey.nl',
  'intersport',
];

describe('"Hoe denkt dit merk over sticks?"', () => {
  const withPhilosophy = BRAND_PROFILES.filter((b) => b.philosophy);

  it('is filled in for at least the brands that explain it on their own site', () => {
    expect(withPhilosophy.length).toBeGreaterThan(0);
  });

  it.each(withPhilosophy)(
    '$brand only cites its own website, with a date',
    (profile) => {
      const philosophy = profile.philosophy!;
      expect(philosophy.paragraphs.length).toBeGreaterThan(0);
      expect(philosophy.sources.length).toBeGreaterThan(0);
      expect(philosophy.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const source of philosophy.sources) {
        const host = new URL(source.url).hostname;
        expect(
          NOT_BRAND_HOSTS.some((h) => host.includes(h)),
          `${profile.brand}: ${host}`,
        ).toBe(false);
      }
    },
  );
});
