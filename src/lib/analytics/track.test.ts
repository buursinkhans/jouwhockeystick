import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './track';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trackEvent', () => {
  it('is a no-op when there is no window (server rendering)', () => {
    expect(() => trackEvent({ name: 'quiz_start' })).not.toThrow();
  });

  it('pushes the event onto window.dataLayer when present', () => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal('window', { dataLayer });

    trackEvent({ name: 'quiz_start' });

    expect(dataLayer).toEqual([{ name: 'quiz_start' }]);
  });
});
