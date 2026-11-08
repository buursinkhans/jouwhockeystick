'use client';

import { useSyncExternalStore } from 'react';

/**
 * The sticks a visitor ticked to compare (UX phase 2, 2026-11-08): at most
 * three slugs, in this browser only (localStorage), never sent anywhere.
 * Every read and write is guarded: private windows may block storage, and
 * the page must work without it.
 */
export const MAX_COMPARE = 3;
const KEY = 'vergelijk:v1';
const EVENT = 'vergelijk-change';
const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(slugs: readonly string[]) {
  cache = slugs;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Storage blocked: the choice still lasts while the page is open.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function useCompareSelection(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Adds or removes a stick; adding a fourth does nothing (the toggle says why). */
export function toggleCompare(slug: string) {
  const current = read();
  if (current.includes(slug)) write(current.filter((s) => s !== slug));
  else if (current.length < MAX_COMPARE) write([...current, slug]);
}

export function clearCompare() {
  write([]);
}

/** "/vergelijk?a=…&b=…&c=…" for the ticked sticks. */
export function compareUrl(slugs: readonly string[]): string {
  const params = new URLSearchParams();
  (['a', 'b', 'c'] as const).forEach((key, i) => {
    const slug = slugs[i];
    if (slug) params.set(key, slug);
  });
  return `/vergelijk?${params.toString()}`;
}
