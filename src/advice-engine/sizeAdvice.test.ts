import { describe, expect, it } from 'vitest';
import { findShorterSize, getSizeAdvice, matchSize } from './sizeAdvice';
import { buildProduct, sourced } from './testFixtures';

describe('getSizeAdvice', () => {
  it('gives a single size with high confidence in the middle of a band', () => {
    expect(getSizeAdvice(135)).toEqual({ primaryInch: 31, confidence: 'high', basis: 'single' });
  });

  it('reports a range instead of false precision on a band edge', () => {
    expect(getSizeAdvice(132)).toMatchObject({ primaryInch: 30, alternativeInch: 31, basis: 'borderline', confidence: 'medium' });
    expect(getSizeAdvice(148)).toMatchObject({ primaryInch: 34, alternativeInch: 33 });
  });

  it('picks within a two-size band by height and keeps the other as alternative', () => {
    expect(getSizeAdvice(110)).toMatchObject({ primaryInch: 24, alternativeInch: 26, basis: 'two_sizes' });
    expect(getSizeAdvice(114)).toMatchObject({ primaryInch: 26, alternativeInch: 24 });
  });

  it('advises 36.5 inch from 163 cm, with no longer alternative', () => {
    expect(getSizeAdvice(174)).toEqual({ primaryInch: 36.5, confidence: 'high', basis: 'single' });
    expect(getSizeAdvice(210).alternativeInch).toBeUndefined();
  });

  it('lowers confidence when the height is uncertain', () => {
    expect(getSizeAdvice(135, { heightUncertain: true }).confidence).toBe('low');
  });

  it('flags a current stick that differs more than one inch from the advice', () => {
    expect(getSizeAdvice(154, { currentLengthInch: 36.5 }).differsFromCurrentInch).toBe(36.5);
    expect(getSizeAdvice(154, { currentLengthInch: 35 }).differsFromCurrentInch).toBeUndefined();
  });
});

describe('matchSize / findShorterSize', () => {
  const product = buildProduct({ lengthsInches: sourced.lengths([30, 32, 34]) });

  it('matches the primary size before the alternative', () => {
    expect(matchSize(product, getSizeAdvice(130))).toBe('primary');
    expect(matchSize(product, getSizeAdvice(137))).toBe('alternative');
    expect(matchSize(product, getSizeAdvice(135))).toBe('none');
  });

  it('only ever offers a shorter size, at most one size down', () => {
    expect(findShorterSize(product, getSizeAdvice(135))).toBe(30);
    expect(findShorterSize(product, getSizeAdvice(125))).toBeUndefined();
  });
});
