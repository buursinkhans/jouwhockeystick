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

/**
 * The same for the stickwijzer (2026-11-24): a click from the search to the
 * stickwijzer is remembered for 30 minutes, so `quiz_start` and `quiz_complete`
 * can say `source: 'search'`. It is cleared when the quiz is completed, so a
 * later quiz of the same visit is not counted as coming from the search.
 */
const WIJZER_KEY = 'jhs-zoek-wijzer';
const WIJZER_MAX_AGE_MS = 30 * 60 * 1000;

export function markStickwijzerFromSearch(): void {
  try {
    window.sessionStorage.setItem(WIJZER_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the quiz is simply not attributed to the search.
  }
}

/** True when the stickwijzer was opened from the search in the last 30 minutes. */
export function stickwijzerFromSearch(): boolean {
  try {
    const at = Number(window.sessionStorage.getItem(WIJZER_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at <= WIJZER_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearStickwijzerFromSearch(): void {
  try {
    window.sessionStorage.removeItem(WIJZER_KEY);
  } catch {
    // Nothing to clear.
  }
}
