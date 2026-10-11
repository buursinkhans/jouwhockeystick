import { describe, expect, it } from 'vitest';
import { isIndoorSeason } from './home';

describe('isIndoorSeason', () => {
  it('is on from October through February', () => {
    for (const month of [10, 11, 12, 1, 2]) {
      expect(isIndoorSeason(new Date(2026, month - 1, 15))).toBe(true);
    }
  });

  it('is off from March through September', () => {
    for (const month of [3, 4, 5, 6, 7, 8, 9]) {
      expect(isIndoorSeason(new Date(2026, month - 1, 15))).toBe(false);
    }
  });
});
