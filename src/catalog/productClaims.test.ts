import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * No price claims in the hand-written product texts (CLAUDE.md, Commerce; the
 * same rule as the articles test, extended to the catalog on 2026-11-09).
 * "Laagste prijs" belongs only to the computed badge and card label, never
 * to a fixed sentence that goes stale when prices change.
 */
const CLAIMS = /goedkoopst|beste prijs|scherpste prijs|laagste (advies)?prijs/i;
const dir = join(process.cwd(), 'src/catalog/products');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

describe('product texts in src/catalog/products/', () => {
  it('has product files to check', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)('%s makes no "goedkoopst" or "laagste prijs" claim', (file) => {
    const lines = readFileSync(join(dir, file), 'utf8')
      .split(/\r?\n/)
      // Code comments may name the rule itself; only the texts count.
      .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line));
    expect(lines.filter((line) => CLAIMS.test(line))).toEqual([]);
  });
});
