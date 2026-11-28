import { describe, expect, it } from 'vitest';
import { monthPeriods } from './months';

describe('monthPeriods', () => {
  it('geeft hele maanden en laat de lopende maand gisteren eindigen', () => {
    expect(monthPeriods(new Date('2026-12-05T10:00:00Z'), '2026-10')).toEqual({
      '2026-10': { from: '2026-10-01', to: '2026-10-31' },
      '2026-11': { from: '2026-11-01', to: '2026-11-30' },
      '2026-12': { from: '2026-12-01', to: '2026-12-04' },
    });
  });
  it('kijkt op de eerste van de maand nog naar de vorige maand', () => {
    expect(Object.keys(monthPeriods(new Date('2026-11-01T04:00:00Z'), '2026-10'))).toEqual(['2026-10']);
  });
  it('houdt hoogstens de laatste maanden', () => {
    expect(Object.keys(monthPeriods(new Date('2028-06-15T00:00:00Z'), '2026-10', 3))).toEqual(['2028-04', '2028-05', '2028-06']);
  });
});
