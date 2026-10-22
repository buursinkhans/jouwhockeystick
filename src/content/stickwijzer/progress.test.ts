import { describe, expect, it } from 'vitest';
import { remainingTimeText } from './progress';

describe('remainingTimeText', () => {
  it('rounds to whole minutes, at least one', () => {
    expect(remainingTimeText(3, false)).toBe('nog ongeveer 1 minuut');
    expect(remainingTimeText(15, false)).toBe('nog ongeveer 3 minuten');
  });

  it('says so on the last step', () => {
    expect(remainingTimeText(1, true)).toBe('laatste stap');
  });
});
