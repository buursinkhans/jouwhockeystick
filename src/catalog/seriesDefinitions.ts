/**
 * The series comparisons under /vergelijk/<slug> (wave 1, decision log
 * 2026-11-22). Only which sticks belong to a series: whether a series is
 * complete enough to be indexed is decided from the catalog data in
 * `series.ts`. No imports, so IndexNow can read this file (src/seo/indexnow.ts).
 *
 * A test of explicit "A vs B" searches, not a claim of demand: in Search
 * Console those terms hardly occur, but there was no page to catch them yet.
 */
export type SeriesDefinition = {
  /** The URL: /vergelijk/<slug>. */
  slug: string;
  brand: string;
  discipline: 'veld' | 'zaal';
  /** "sticks uit de JB-serie van Grays": completes "In deze vergelijking staan 4 …". */
  noun: string;
  /** "JB-serie" or "zaalsticks": completes "Grays …" in the H1 and the title. */
  name: string;
  /** The sticks of the series; a stick that is not complete enough drops out of the table, not out of the page. */
  members: readonly { slug: string; /** Short name used in text and table. */ label: string }[];
};

export const SERIES: readonly SeriesDefinition[] = [
  {
    slug: 'grays-jb-serie',
    brand: 'Grays',
    discipline: 'veld',
    noun: 'sticks uit de JB-serie van Grays',
    name: 'JB-serie',
    members: [
      { slug: 'grays-jb6-composite', label: 'JB 6' },
      { slug: 'grays-jb8-composite', label: 'JB 8' },
      { slug: 'grays-jb10-composite', label: 'JB 10' },
      { slug: 'grays-jb12-plus-composite', label: 'JB 12+' },
    ],
  },
  {
    slug: 'grays-zaalsticks',
    brand: 'Grays',
    discipline: 'zaal',
    noun: 'zaalsticks van Grays',
    name: 'zaalsticks',
    members: [
      { slug: 'grays-jb3xi-jumbow-indoor', label: 'JB3Xi' },
      { slug: 'grays-jb8xi-composite-indoor', label: 'JB8Xi' },
      { slug: 'grays-6i-dynabow-indoor', label: '6i' },
      { slug: 'grays-4i-dynabow-indoor', label: '4i' },
      { slug: 'grays-200i-ultrabow-indoor', label: '200i' },
      { slug: 'grays-db2xi-dynabow-indoor', label: 'DB2Xi' },
      { slug: 'grays-pb9i-indoor', label: 'PB9i' },
      { slug: 'grays-pb10xi-composite-indoor', label: 'PB10Xi' },
    ],
  },
];

export const seriesPath = (slug: string) => `/vergelijk/${slug}`;
