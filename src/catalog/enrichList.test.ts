import { describe, expect, it } from 'vitest';
import { buildProduct } from '@/advice-engine/testFixtures';
import { rankForEnrichment } from './enrichList';

const stick = (slug: string, name: string, price = 80) =>
  buildProduct({
    slug,
    brand: 'Brabo',
    name,
    priceIndicativeEur: {
      value: price,
      source: 'partner-shop',
      lastVerifiedAt: '2026-10-19',
    },
  });

describe('rankForEnrichment', () => {
  const sticks = [
    stick('a', 'Brabo Tribute 30 LowBow'),
    stick('b', 'Brabo Pure 20 ProBow'),
    stick('c', 'Brabo O Geez Hout Junior'),
  ];

  it('ranks by how often the stickwijzer advises a stick, best matches counting double', () => {
    const ranked = rankForEnrichment(
      sticks,
      new Map([
        ['a', { inAdvice: 30, bestMatch: 0 }],
        ['b', { inAdvice: 10, bestMatch: 15 }],
      ]),
      [],
    );
    expect(ranked.map((c) => c.product.slug)).toEqual(['b', 'a']);
  });

  it('lifts a stick that is among bol.com’s most popular sticks', () => {
    const ranked = rankForEnrichment(
      sticks,
      new Map([['a', { inAdvice: 30, bestMatch: 0 }]]),
      ['Brabo O Geez Hout Junior hockeystick - 30 inch'],
    );
    expect(ranked[0]?.product.slug).toBe('c');
    expect(ranked[0]?.bolPopular).toBe(true);
  });

  it('leaves out sticks with no signal at all', () => {
    expect(rankForEnrichment(sticks, new Map(), [])).toEqual([]);
  });
});
