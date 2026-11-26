/**
 * Settings of the monthly SEO opportunity report (docs/seo-market-intelligence-plan.md,
 * appendix C and D). One file, so the owner can change the lists without touching
 * the logic in opportunities.ts.
 */

/**
 * Words that make a search a brand search (owner decision 2026-11-25).
 * - `eigen`: our own name; these searchers already know the site.
 * - `merkwoorden`: product brands the owner chose to count as brand words. They are
 *   reported apart inside "merk", so their demand stays visible for brand-page choices.
 * Other product brands (Osaka, Grays, Brabo) are not brand words: they count as
 * non-brand searches. Spaces, dots and hyphens are ignored when matching, and a
 * term of 8 or more characters also matches one typing error.
 */
export const SEO_BRAND_TERMS = {
  eigen: ['jouwhockeystick', 'jouw hockeystick', 'jouwhockeystick.nl'],
  merkwoorden: [
    'indian maharadja',
    'indian maharaja',
    'indian marahadja',
    'indian maharadjah',
    'princess',
  ],
} as const;

export type BrandTerms = { eigen: readonly string[]; merkwoorden: readonly string[] };

/**
 * Words that say what a visitor wants. A proposal that is tested on the data of
 * the first runs; intent is derived from rules, never guessed by a model.
 */
export const INTENT_WORDS = {
  kopen: [
    'kopen',
    'koop',
    'bestellen',
    'sale',
    'aanbieding',
    'aanbiedingen',
    'korting',
    'goedkoop',
    'goedkope',
    'prijs',
    'prijzen',
    'webshop',
    'winkel',
    'outlet',
  ],
  vergelijken: ['vs', 'versus', 'verschil', 'vergelijk', 'vergelijken', 'beste', 'review', 'reviews', 'ervaring', 'ervaringen', 'test'],
  informatie: [
    'maat',
    'maten',
    'lengte',
    'welke',
    'hoe',
    'wat',
    'waarom',
    'kind',
    'kinderen',
    'junior',
    'beginner',
    'beginners',
    'tips',
    'carbon',
    'bow',
    'kromming',
    'gewicht',
    'tabel',
    'advies',
    'kiezen',
  ],
} as const;

/**
 * Words that point at one of our category pages. A query with one of them is not "outside our offer"
 * even when no stick, brand or article matches by name ("zaalsticks" has the page /zaalsticks).
 * Found on the first real run (2026-11-26): "zaalsticks" was reported as a social idea.
 */
export const CATEGORY_WORDS: readonly { path: string; words: readonly string[] }[] = [
  // Shoes first: "zaalhockeyschoenen" is a shoe query, not a zaal stick query (second real run, 2026-11-26).
  {
    path: '/hockeyschoenen',
    words: ['hockeyschoenen', 'hockeyschoen', 'zaalhockeyschoenen', 'zaalhockeyschoen', 'zaalschoenen', 'zaalschoen', 'veldhockeyschoenen', 'indoorschoenen', 'schoenen', 'schoen'],
  },
  {
    path: '/zaalsticks',
    words: ['zaalsticks', 'zaalstick', 'zaalhockeystick', 'zaalhockeysticks', 'indoorsticks', 'indoorstick', 'indoorhockeystick', 'zaal', 'indoor'],
  },
  { path: '/sticks', words: ['veldsticks', 'veldstick', 'veldhockeystick', 'veldhockeysticks', 'veld'] },
];

/** Words that describe the category and do not name a model: removed before looking for our own offer. */
export const GENERIC_WORDS = [
  'hockeystick',
  'hockeysticks',
  'hockey',
  'stick',
  'sticks',
  'kopen',
  'koop',
  'online',
  'bestellen',
  'sale',
  'aanbieding',
  'aanbiedingen',
  'goedkoop',
  'goedkope',
  'prijs',
  'prijzen',
  'korting',
] as const;

/**
 * The owner's keyword table: one page per search query (decision log 2026-11-14).
 * When the search engine shows another page for such a query, the report points
 * to the assigned page and never asks to improve the page that is shown.
 * Keys are lowercase with single spaces (see normalizeQuery).
 */
export const KEYWORD_PAGES: Readonly<Record<string, string>> = {
  'welke hockeystick kopen': '/kennis/hoe-kies-je-de-juiste-hockeystick',
  'hoe kies je een hockeystick': '/kennis/hoe-kies-je-de-juiste-hockeystick',
  veldhockeystick: '/sticks',
  veldhockeysticks: '/sticks',
  veldsticks: '/sticks',
  'hockeysticks vergelijken': '/sticks',
  'hockeystick uitproberen': '/blog/hockeystick-kopen',
};

/**
 * Thresholds: a proposal, to be tested after the first runs (plan, appendix C.3).
 * Search Console averages the position over impressions, so with few impressions
 * one ranking test decides the average.
 */
export const THRESHOLDS = {
  /** A query with fewer impressions in the period is "Onvoldoende data". */
  minImpressions: 10,
  /** From this many impressions in both periods a conclusion is "hoog" certain. */
  strongImpressions: 30,
  /** A position this many places worse than the period before is a loss. */
  positionWorse: 3,
  /** ...and only counts when the earlier position was this good: further down, positions swing on their own. */
  lossMaxPosition: 20,
  /** Cannibalisation: the second page needs this many impressions over 90 days... */
  cannibalMinImpressions: 10,
  /** ...and this share of the impressions of the query. */
  cannibalMinShare: 0.25,
  maxRecommendations: 5,
  maxSkipped: 3,
  maxBrandWords: 10,
  /** Months of history kept in the sealed file. */
  historyMonths: 12,
} as const;

/**
 * Impressions follow the season (hockeystick: three peaks a year, zaal only in
 * November and December; Google Trends, exported 2026-11-25). Until Phase 2 adds the
 * Trends index, position is the main measure and impressions are never judged alone.
 */
/** The note when a Google Trends export is available: the season effect is shown next to the real change. */
export const SEASON_NOTE_TRENDS =
  'Vertoningen volgen het seizoen. Het seizoenseffect in de kaart Seizoen komt uit Google Trends (een relatieve index, geen zoekaantallen) en is een verwachting uit eerdere jaren. De positie blijft de hoofdmaat: lees de gecorrigeerde verandering als richting.';

export const SEASON_NOTE =
  'Vertoningen volgen het seizoen. Tot de Trends-index is toegevoegd, is de positie de hoofdmaat en worden vertoningen niet los beoordeeld.';
