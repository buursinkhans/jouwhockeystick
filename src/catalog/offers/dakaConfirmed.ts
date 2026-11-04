/**
 * Stick matches with Daka that the owner confirmed by hand (same model and
 * model year): slug → product page on daka.nl. The Daka feed has almost no
 * EANs and rarely a year in the name, so many matches stay 'twijfel'; the
 * weekly sync PR lists them. A confirmed page gets a button only while the
 * feed lists it in stock (scripts/daka-feed.ts). Edited by hand, never by the sync.
 */
export const DAKA_CONFIRMED: Readonly<Record<string, string>> = {};
