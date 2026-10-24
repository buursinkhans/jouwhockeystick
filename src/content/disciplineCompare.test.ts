import { describe, expect, it } from 'vitest';
import { getFieldProducts, getIndoorProducts } from '@/catalog';
import { plainText } from '@/components/article/inlineMarkup';
import { disciplineDifferences } from './disciplineCompare';
import { veldstickZaalhockey } from './articles/veldstick-zaalhockey';

const field = getFieldProducts(new Date('2026-10-24'));
const indoor = getIndoorProducts(new Date('2026-10-24'));

describe('disciplineDifferences', () => {
  it('computes the length ranges from the catalog', () => {
    const lengths = (ps: typeof field) =>
      ps.flatMap((p) => p.lengthsInches.value);
    const inch = (n: number) => String(n).replace('.', ',');
    const text = disciplineDifferences(field, indoor).join('\n');
    expect(text).toContain(
      `veldsticks in onze catalogus zijn er van ${inch(Math.min(...lengths(field)))} tot ${inch(Math.max(...lengths(field)))} inch`,
    );
    expect(text).toContain(
      `zaalsticks van ${inch(Math.min(...lengths(indoor)))} tot ${inch(Math.max(...lengths(indoor)))} inch`,
    );
  });

  it('leaves a point out when one side has too little data', () => {
    const noWeight = (ps: typeof field) =>
      ps.map((p) => ({ ...p, weightGrams: undefined }));
    const noBow = (ps: typeof field) =>
      ps.map((p) => ({ ...p, bowProfile: undefined }));
    expect(
      disciplineDifferences(noWeight(field), noWeight(indoor)).join(' '),
    ).not.toContain('Gewicht');
    expect(disciplineDifferences(field, noBow(indoor)).join(' ')).not.toContain(
      'Kromming',
    );
    expect(disciplineDifferences([], [])).toEqual([]);
  });

  it('never states a value that is not in the data', () => {
    expect(disciplineDifferences(field, indoor).join(' ')).not.toMatch(
      /undefined|NaN|Infinity/,
    );
  });
});

describe('/kennis/veldstick-zaalhockey', () => {
  it('names the difference within the first 80 words', () => {
    const first80 = plainText(veldstickZaalhockey.intro)
      .split(/\s+/)
      .slice(0, 80)
      .join(' ');
    expect(first80).toContain('verschil');
    expect(first80).toContain('FIH');
  });

  it('does not bring back the "lichter en dunner" claim', () => {
    const text = JSON.stringify(veldstickZaalhockey).toLowerCase();
    expect(text).not.toMatch(/lichter en dunner|dunner en lichter/);
  });

  it('opens with the difference section', () => {
    expect(veldstickZaalhockey.sections[0]?.heading).toBe(
      'Wat is het verschil tussen een veld- en zaalstick?',
    );
  });
});
