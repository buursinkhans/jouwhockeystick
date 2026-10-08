/**
 * Search Console analysis (read-only): turns Search Analytics rows into a
 * weekly Dutch report of opportunities. Pure functions — the API calls live
 * in scripts/search-console-report.ts.
 */

export type SearchRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  /** Average position, 1 = top. */
  position: number;
};

export type Totals = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type Period = { start: string; end: string };

/** Thresholds are low on purpose: the site is young and data is sparse. */
export const NEAR_PAGE_ONE = { minPosition: 4.5, maxPosition: 20, minImpressions: 3 };
export const LOW_CTR = { maxPosition: 5, minImpressions: 20, maxCtr: 0.02 };
const NEW_QUERY_MIN_IMPRESSIONS = 3;
const LIST_LIMIT = 15;

export function totals(rows: SearchRow[]): Totals {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  // Impression-weighted average position, as Search Console reports it.
  const weighted = rows.reduce(
    (sum, row) => sum + row.position * row.impressions,
    0,
  );
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weighted / impressions : 0,
  };
}

/** Queries ranking just below the top, sorted by impressions: the cheapest growth. */
export function nearPageOne(rows: SearchRow[]): SearchRow[] {
  return rows
    .filter(
      (row) =>
        row.position >= NEAR_PAGE_ONE.minPosition &&
        row.position <= NEAR_PAGE_ONE.maxPosition &&
        row.impressions >= NEAR_PAGE_ONE.minImpressions,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, LIST_LIMIT);
}

/** Ranks well but hardly gets clicked: title or description may not convince. */
export function lowCtr(rows: SearchRow[]): SearchRow[] {
  return rows
    .filter(
      (row) =>
        row.position <= LOW_CTR.maxPosition &&
        row.impressions >= LOW_CTR.minImpressions &&
        row.clicks / row.impressions < LOW_CTR.maxCtr,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, LIST_LIMIT);
}

/** Queries with impressions now that had none in the previous period. */
export function newQueries(current: SearchRow[], previous: SearchRow[]): SearchRow[] {
  const before = new Set(previous.map((row) => row.query));
  return current
    .filter(
      (row) =>
        !before.has(row.query) && row.impressions >= NEW_QUERY_MIN_IMPRESSIONS,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, LIST_LIMIT);
}

export type PageSummary = {
  page: string;
  clicks: number;
  impressions: number;
  previousImpressions: number;
};

export function pages(current: SearchRow[], previous: SearchRow[]): PageSummary[] {
  const byPage = new Map<string, PageSummary>();
  const entry = (page: string): PageSummary => {
    const existing = byPage.get(page);
    if (existing) return existing;
    const created = { page, clicks: 0, impressions: 0, previousImpressions: 0 };
    byPage.set(page, created);
    return created;
  };
  for (const row of current) {
    const summary = entry(row.page);
    summary.clicks += row.clicks;
    summary.impressions += row.impressions;
  }
  for (const row of previous) {
    entry(row.page).previousImpressions += row.impressions;
  }
  return [...byPage.values()].sort((a, b) => b.impressions - a.impressions);
}

const pct = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const pos = (value: number) => value.toFixed(1).replace('.', ',');
const path = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};
const delta = (now: number, before: number) => {
  if (before === 0) return now > 0 ? 'nieuw' : '–';
  const change = (now - before) / before;
  return `${change >= 0 ? '+' : ''}${Math.round(change * 100)}%`;
};

function queryTable(rows: SearchRow[], empty: string): string[] {
  if (rows.length === 0) return [empty];
  return [
    '| Zoekwoord | Pagina | Positie | Vertoningen | Kliks |',
    '|---|---|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${row.query} | ${path(row.page)} | ${pos(row.position)} | ${row.impressions} | ${row.clicks} |`,
    ),
  ];
}

export function formatReport(input: {
  siteUrl: string;
  current: Period;
  previous: Period;
  /** Query × page rows. Search Console leaves out rare (anonymised) queries here. */
  currentRows: SearchRow[];
  previousRows: SearchRow[];
  /**
   * Rows per page only (query left empty). These include anonymised
   * queries, so totals and page figures come from here.
   */
  currentPages: SearchRow[];
  previousPages: SearchRow[];
}): string {
  const now = totals(input.currentPages);
  const before = totals(input.previousPages);
  const pageList = pages(input.currentPages, input.previousPages);
  const hidden = now.impressions - totals(input.currentRows).impressions;
  const stickPages = pageList.filter((page) => path(page.page).startsWith('/sticks/'));

  return [
    `# Search Console ${input.current.start} t/m ${input.current.end}`,
    '',
    `Bron: \`${input.siteUrl}\`, vergeleken met ${input.previous.start} t/m ${input.previous.end}. Alleen lezen; er is niets aan de site veranderd.`,
    '',
    '| | Nu | Vorige periode | Verschil |',
    '|---|---|---|---|',
    `| Kliks | ${now.clicks} | ${before.clicks} | ${delta(now.clicks, before.clicks)} |`,
    `| Vertoningen | ${now.impressions} | ${before.impressions} | ${delta(now.impressions, before.impressions)} |`,
    `| CTR | ${pct(now.ctr)} | ${pct(before.ctr)} | |`,
    `| Gem. positie | ${pos(now.position)} | ${pos(before.position)} | |`,
    '',
    ...(now.impressions === 0
      ? [
          '> **Nog geen vertoningen in Google.** Controleer in Search Console onder *Indexering → Pagina’s* of de pagina’s geïndexeerd zijn, en dien de sitemap in (`https://jouwhockeystick.nl/sitemap.xml`) als dat nog niet is gebeurd.',
          '',
        ]
      : []),
    ...(hidden > 0
      ? [
          `_${hidden} vertoningen komen van zeldzame zoekwoorden die Google om privacyredenen niet per zoekwoord toont; ze tellen wel mee in de totalen en per pagina._`,
          '',
        ]
      : []),
    '## Bijna pagina 1',
    'Zoekwoorden op positie 5–20: met een betere pagina of interne links vaak de goedkoopste groei.',
    '',
    ...queryTable(nearPageOne(input.currentRows), 'Nog geen zoekwoorden in deze zone.'),
    '',
    '## Goed zichtbaar, weinig kliks',
    'Top-5-positie maar CTR onder 2%: titel of beschrijving overtuigt mogelijk niet.',
    '',
    ...queryTable(lowCtr(input.currentRows), 'Geen.'),
    '',
    '## Nieuwe zoekwoorden',
    '',
    ...queryTable(newQueries(input.currentRows, input.previousRows), 'Geen nieuwe zoekwoorden.'),
    '',
    '## Stickpagina’s',
    'Welke sticks vertoningen krijgen: hier is een eigen vergelijkende alinea het meest waard (decision log 2026-10-08).',
    '',
    ...(stickPages.length === 0
      ? ['Nog geen vertoningen op stickpagina’s.']
      : [
          '| Pagina | Vertoningen | Vorige periode | Kliks |',
          '|---|---|---|---|',
          ...stickPages
            .slice(0, LIST_LIMIT)
            .map(
              (page) =>
                `| ${path(page.page)} | ${page.impressions} | ${page.previousImpressions} | ${page.clicks} |`,
            ),
        ]),
    '',
    '_Automatisch gegenereerd door de wekelijkse Search Console-agent._',
  ].join('\n');
}
