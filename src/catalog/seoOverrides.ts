/**
 * Own search-result text for a few stick pages (wave 0, 2026-11-22). Every
 * other stick keeps the title and description that are built from its data
 * (`productPageMetadata`, `productMetaDescription`). An entry may only say
 * what the page itself shows: the title names the question of the searcher,
 * the closing sentence replaces the fixed "Bekijk specs, ..." sentence. Bow,
 * carbon and level still come from the catalog, so they cannot drift.
 *
 * IndexNow reads this file: when it changes, the pages of all entries are
 * reported (`urlsForFiles` in src/seo/indexnow.ts).
 */
export type StickSeoOverride = {
  /** <title>, at most 60 characters. */
  title: string;
  /** Closing sentence of the meta description. */
  closing: string;
};

export const STICK_SEO_OVERRIDES: Readonly<Record<string, StickSeoOverride>> = {
  // 106 impressions at position 8,3 and no clicks (Search Console, 3 months to 2026-11-20).
  // The page shows the Jumbow-line table with JB 6, 8, 10 and 12+ and the shop prices.
  'grays-jb10-composite': {
    title: 'Grays JB10 hockeystick: specs, prijs en verschil met JB8',
    closing: 'Zie specs, prijzen en het verschil met JB6, JB8 en JB12+.',
  },
};
