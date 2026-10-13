import { describe, expect, it } from 'vitest';
import {
  LENGTH_GUIDE,
  alsoFitsInch,
  findShorterSize,
  getSizeAdvice,
  matchSize,
} from './sizeAdvice';
import { buildProduct, sourced } from './testFixtures';

describe('getSizeAdvice', () => {
  it('gives a child the shorter neighbouring size as a fit, never a longer one', () => {
    expect(getSizeAdvice(135)).toEqual({
      primaryInch: 31,
      alternativeInch: 30,
      confidence: 'high',
      basis: 'neighbour',
    });
    // Top of a band: still the shorter size, not "op de groei".
    expect(getSizeAdvice(132)).toMatchObject({
      primaryInch: 30,
      alternativeInch: 29,
    });
  });

  it('reports a range with lower confidence on the lower band edge', () => {
    expect(getSizeAdvice(148)).toMatchObject({
      primaryInch: 34,
      alternativeInch: 33,
      basis: 'borderline',
      confidence: 'medium',
    });
  });

  it('picks within a two-size band by height and keeps the other as alternative', () => {
    expect(getSizeAdvice(110)).toMatchObject({
      primaryInch: 24,
      alternativeInch: 26,
      basis: 'two_sizes',
    });
    expect(getSizeAdvice(114)).toMatchObject({
      primaryInch: 26,
      alternativeInch: 24,
    });
  });

  it('advises 36.5 inch from 163 cm, 37.5 from 185 cm and 38.5 from 193 cm', () => {
    expect(getSizeAdvice(168)).toMatchObject({
      primaryInch: 36.5,
      alternativeInch: 35,
    });
    // Adults may get the longer neighbour too.
    expect(getSizeAdvice(180)).toMatchObject({
      primaryInch: 36.5,
      alternativeInch: 37.5,
      confidence: 'high',
    });
    expect(getSizeAdvice(187)).toMatchObject({
      primaryInch: 37.5,
      alternativeInch: 36.5,
    });
    expect(getSizeAdvice(191)).toMatchObject({
      primaryInch: 37.5,
      alternativeInch: 38.5,
    });
    expect(getSizeAdvice(205)).toMatchObject({
      primaryInch: 38.5,
      alternativeInch: 37.5,
    });
  });

  it('lists the same also-fitting sizes as the length table', () => {
    expect(LENGTH_GUIDE.map(alsoFitsInch)).toEqual([
      [],
      [],
      [],
      [28],
      [29],
      [30],
      [31],
      [32],
      [33],
      [34],
      [35, 37.5],
      [36.5, 38.5],
      [37.5],
    ]);
  });

  it('lowers confidence when the height is uncertain', () => {
    expect(getSizeAdvice(135, { heightUncertain: true }).confidence).toBe(
      'low',
    );
  });

  it('flags a current stick that differs more than one inch from the advice', () => {
    expect(
      getSizeAdvice(154, { currentLengthInch: 36.5 }).differsFromCurrentInch,
    ).toBe(36.5);
    expect(
      getSizeAdvice(154, { currentLengthInch: 35 }).differsFromCurrentInch,
    ).toBeUndefined();
  });
});

describe('matchSize / findShorterSize', () => {
  const product = buildProduct({
    lengthsInches: sourced.lengths([30, 32, 34]),
  });

  it('matches the primary size before the alternative', () => {
    expect(matchSize(product, getSizeAdvice(130))).toBe('primary');
    expect(matchSize(product, getSizeAdvice(135))).toBe('alternative');
    expect(matchSize(product, getSizeAdvice(125))).toBe('none');
  });

  it('only ever offers a shorter size, at most one size down', () => {
    expect(findShorterSize(product, getSizeAdvice(135))).toBe(30);
    expect(findShorterSize(product, getSizeAdvice(125))).toBeUndefined();
  });
});
