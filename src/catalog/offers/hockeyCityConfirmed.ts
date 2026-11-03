/**
 * Stick matches with HockeyCity that the owner confirmed by hand (same model
 * and model year): slug → product page on hockeycity.nl. The HockeyCity feed
 * has no maker EANs for sticks and rarely a year in the name, so many matches
 * stay 'twijfel'; the weekly sync PR lists them. A confirmed page gets a
 * button only while the feed lists it in stock (scripts/hockeycity-feed.ts).
 * Edited by hand, never by the sync.
 */
export const HOCKEYCITY_CONFIRMED: Readonly<Record<string, string>> = {};
