/**
 * Own visits stay out of the statistics (2026-11-11). Open the site once on a
 * device with `?intern=aan`; from then on that browser sends no PostHog events
 * and no funnel events. `?intern=uit` undoes it. Nothing is sent anywhere:
 * the only thing stored is one flag in the browser of the person who asked
 * for it (see docs/analytics.md for the privacy side). Regular visitors are
 * never touched: without the parameter this reads one key and does nothing.
 */
export const INTERNAL_KEY = 'jhs-intern';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function localStore(): Store | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null; // blocked storage: the visit counts as regular
  }
}

/** Handles `?intern=aan|uit` in a query string. Returns what it did. */
export function applyInternalParam(search: string, store: Store | null = localStore()): 'aan' | 'uit' | null {
  const value = new URLSearchParams(search).get('intern');
  if (!store || (value !== 'aan' && value !== 'uit')) return null;
  try {
    if (value === 'aan') store.setItem(INTERNAL_KEY, '1');
    else store.removeItem(INTERNAL_KEY);
    return value;
  } catch {
    return null;
  }
}

export function isInternalVisitor(store: Store | null = localStore()): boolean {
  try {
    return store?.getItem(INTERNAL_KEY) === '1';
  } catch {
    return false;
  }
}
