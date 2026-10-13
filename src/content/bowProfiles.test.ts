import { describe, expect, it } from 'vitest';
import { BOW_LABELS } from '@/catalog/labels';
import type { BowProfile } from '@/catalog/types';
import { BOW_FIGURE_OPTIONS, bowDepthAt } from './bowProfiles';

describe('bow profile figure', () => {
  it('covers every bow profile in the catalogue exactly once', () => {
    const covered = BOW_FIGURE_OPTIONS.flatMap((option) => option.profiles);
    const all = Object.keys(BOW_LABELS) as BowProfile[];
    expect([...covered].sort()).toEqual([...all].sort());
  });

  it('orders the deepest point from grip side to hook side', () => {
    const peaks = BOW_FIGURE_OPTIONS.map((option) => option.peak);
    expect([...peaks].sort((a, b) => b - a)).toEqual(peaks);
  });

  it.each(BOW_FIGURE_OPTIONS)(
    '$label is zero at both ends and deepest at its peak',
    ({ peak }) => {
      expect(bowDepthAt(0, peak)).toBe(0);
      expect(bowDepthAt(1, peak)).toBe(0);
      expect(bowDepthAt(peak, peak)).toBeCloseTo(1);
      for (let i = 1; i < 100; i += 1) {
        expect(bowDepthAt(i / 100, peak)).toBeLessThanOrEqual(1 + 1e-9);
      }
    },
  );
});
