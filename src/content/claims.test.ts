import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * "Onafhankelijk" and "objectief" are not claims the site can back up: it earns
 * from partner links. The verifiable statement is that shop fees do not count
 * in the advice (decision log 2026-11-11). Source labels such as
 * "Onafhankelijke bron" (FIH, theses) and factual uses in brands.ts and
 * methodiek.ts stay; they describe a source, not the site.
 */
const CLAIM_FILES = [
  'src/components/layout/Header.tsx',
  'src/components/home/Hero.tsx',
  'src/components/home/WhyUs.tsx',
  'src/content/landingFaqs.ts',
  'src/content/clubs.ts',
  'src/lib/site.ts',
];

describe('onafhankelijk en objectief als claim over de site', () => {
  for (const file of CLAIM_FILES) {
    it(`${file} noemt de site niet onafhankelijk of objectief`, () => {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toMatch(/onafhankelijk|objectie[fv]/i);
    });
  }

  it('de standaard-metabeschrijving noemt de vergoeding en past in 158 tekens', async () => {
    const { DEFAULT_DESCRIPTION } = await import('@/lib/site');
    expect(DEFAULT_DESCRIPTION.length).toBeLessThanOrEqual(158);
    expect(DEFAULT_DESCRIPTION).toMatch(/Winkelvergoedingen tellen niet mee/);
  });
});
