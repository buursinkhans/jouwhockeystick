import { describe, expect, it } from 'vitest';
import { getAllProducts, getFieldProducts } from '@/catalog';
import { candidateCountText } from '@/content/stickwijzer/resultCopy';
import { getAdvice } from './engine';
import { NOW, buildDevelopAnswers } from './testFixtures';

describe('how many sticks the advice chose from', () => {
  it('counts the sticks that pass every filter, never more than the field catalog', () => {
    const catalog = getAllProducts(NOW, { includeImported: true });
    const advice = getAdvice(buildDevelopAnswers(), catalog, { now: NOW });
    expect(advice.candidateCount).toBeGreaterThanOrEqual(advice.results.length);
    expect(advice.candidateCount).toBeLessThanOrEqual(
      getFieldProducts(NOW, { includeImported: true }).length,
    );
  });

  it('says it plainly', () => {
    expect(candidateCountText(42, 3)).toBe(
      'Van alle veldsticks in onze catalogus passen er 42 bij de maat, het niveau en het budget. Hieronder de 3 sticks die het best bij je antwoorden passen.',
    );
    expect(candidateCountText(1, 1)).toBe(
      'Van alle veldsticks in onze catalogus past er 1 bij de maat, het niveau en het budget.',
    );
  });
});
