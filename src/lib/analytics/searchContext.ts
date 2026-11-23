/**
 * Remembers, for the rest of the visit, which stick page the visitor opened from
 * a search result, so a shop click there can be counted as coming from the
 * search (retailer_click with `fromSearch`, owner brief 2026-11-24: which
 * searches lead to affiliate clicks).
 *
 * Only a public path is stored, in sessionStorage of this tab: no typed text,
 * no cookie, nothing sent anywhere by itself. Reads and writes are wrapped
 * because storage can be blocked or full.
 */
const KEY = 'jhs-zoek-pad';

export function markSearchSelection(path: string): void {
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    // Storage blocked: the click is simply not attributed to the search.
  }
}

/** True on the page that was opened from a search result. */
export function isFromSearch(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === window.location.pathname;
  } catch {
    return false;
  }
}
