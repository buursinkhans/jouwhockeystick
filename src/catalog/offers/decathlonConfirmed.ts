/**
 * Stick matches with Decathlon that the owner confirmed by hand (same model and model year):
 * slug → product page on decathlon.nl, without query. The feed has an EAN on every row, so most
 * matches with sticks that PassaHockey also sells are 'zeker' on EAN; a 'twijfel' (same name,
 * another EAN or no PassaHockey EAN) is listed in the weekly sync PR and can be confirmed here. A
 * confirmed page gets a button only while the feed lists a length that is not out of stock
 * (scripts/decathlon-feed.ts). Edited by hand, never by the sync.
 */
export const DECATHLON_CONFIRMED: Readonly<Record<string, string>> = {};

/** Rejected by the owner: no Decathlon button for this slug, whatever the match. */
export const DECATHLON_REJECTED: ReadonlySet<string> = new Set<string>();
