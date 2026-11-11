import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ADVICE_MODE_TEXT, EXTRA_QUESTIONS_HEADING } from './quick';

const root = process.cwd();
const sources = [
  ...readdirSync(join(root, 'src/content/stickwijzer')).map((f) => join('src/content/stickwijzer', f)),
  ...readdirSync(join(root, 'src/components/stickwijzer')).map((f) => join('src/components/stickwijzer', f)),
].filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));

describe('stickwijzer text makes no promise of precision', () => {
  it.each(sources)('%s has no "preciezer" or "nauwkeuriger"', (file) => {
    const text = readFileSync(join(root, file), 'utf8');
    expect(text.match(/preciezer|nauwkeuriger/gi) ?? []).toEqual([]);
  });

  it('describes the extended advice by what it asks, not by how good the result is', () => {
    expect(ADVICE_MODE_TEXT.options[1].description).toBe('Met speelwensen, techniek en stickgevoel: meer vragen, meer kenmerken in het advies.');
    expect(EXTRA_QUESTIONS_HEADING).toBe('Wil je nog meer meegeven?');
  });
});
