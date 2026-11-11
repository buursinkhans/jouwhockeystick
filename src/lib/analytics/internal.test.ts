import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyInternalParam, INTERNAL_KEY, isInternalVisitor } from './internal';
import { resetPosthogClient, setPosthog } from './posthogClient';
import { trackEvent } from './track';

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetPosthogClient();
});

describe('own visits', () => {
  it('switches on with ?intern=aan and off with ?intern=uit', () => {
    const store = memoryStore();
    expect(applyInternalParam('?intern=aan', store)).toBe('aan');
    expect(isInternalVisitor(store)).toBe(true);
    expect(applyInternalParam('?x=1&intern=uit', store)).toBe('uit');
    expect(isInternalVisitor(store)).toBe(false);
  });

  it('does nothing for a regular visit: no parameter, another value, or no storage', () => {
    const store = memoryStore();
    expect(applyInternalParam('', store)).toBeNull();
    expect(applyInternalParam('?intern=ja', store)).toBeNull();
    expect(applyInternalParam('?intern=aan', null)).toBeNull();
    expect(store.data.size).toBe(0);
    expect(isInternalVisitor(store)).toBe(false);
    expect(isInternalVisitor(null)).toBe(false);
  });

  it('counts the visit as regular when the storage throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(applyInternalParam('?intern=aan', broken)).toBeNull();
    expect(isInternalVisitor(broken)).toBe(false);
  });

  it('sends no event, to neither tool, from a browser that switched it on', () => {
    const saEvent = vi.fn();
    const posthog = { capture: vi.fn() };
    vi.stubGlobal('window', { sa_event: saEvent, localStorage: memoryStore({ [INTERNAL_KEY]: '1' }) });
    setPosthog(posthog);
    trackEvent({ name: 'quiz_start' });
    expect(saEvent).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('still sends events from every other browser', () => {
    const saEvent = vi.fn();
    const posthog = { capture: vi.fn() };
    vi.stubGlobal('window', { sa_event: saEvent, localStorage: memoryStore() });
    setPosthog(posthog);
    trackEvent({ name: 'quiz_start' });
    expect(saEvent).toHaveBeenCalledWith('quiz_start', {});
    expect(posthog.capture).toHaveBeenCalledWith('quiz_start', {});
  });
});
