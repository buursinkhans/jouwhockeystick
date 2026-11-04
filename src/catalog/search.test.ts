import { describe, expect, it } from 'vitest';
import { searchCatalog, searchTokens } from './search';
import { isFeedImport } from './index';

describe('searchCatalog (homepage proposal, 2026-11-04)', () => {
  it('splits letters and digits and writes shop shorthand out', () => {
    expect(searchTokens('Grays DB10 PB')).toEqual(['grays', 'dynabow', '10', 'probow']);
    expect(searchTokens('Estro .20 Kids')).toEqual(['estro', '20', 'junior']);
  });

  it('finds a stick by brand and model, and the same with shorthand', () => {
    const long = searchCatalog('grays dynabow 5').sticks.map((p) => p.slug);
    expect(long).toContain('grays-db5-composite');
    expect(searchCatalog('db5').sticks.map((p) => p.slug)).toContain('grays-db5-composite');
    // A number is the whole number: no Grays 500 for "dynabow 5".
    expect(searchCatalog('dynabow 5').sticks.every((p) => !/500/.test(p.name))).toBe(true);
  });

  it('puts hand-checked models before the feed imports', () => {
    const { sticks } = searchCatalog('grays');
    const firstImport = sticks.findIndex(isFeedImport);
    expect(firstImport).toBeGreaterThan(0);
    expect(sticks.slice(firstImport).every(isFeedImport)).toBe(true);
  });

  it('finds shoes, and nothing for an empty or unknown query', () => {
    expect(searchCatalog('asics').shoes.length).toBeGreaterThan(0);
    expect(searchCatalog('   ')).toMatchObject({ sticks: [], shoes: [] });
    expect(searchCatalog('xyzzy-onbekend')).toMatchObject({ sticks: [], shoes: [] });
  });
});
