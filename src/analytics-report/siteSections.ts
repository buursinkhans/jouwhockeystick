/**
 * Conversion figures for the search in the header, the brand pages and the
 * series comparison pages (decision log 2026-11-24). The queries are shared by
 * the weekly Conversie-rapport (scripts/conversion-report.ts) and the daily
 * figures of the Marketingstudio (scripts/daily-metrics.ts), the report text is
 * in `siteSearchSection` and its siblings. Only counts: the typed search text
 * never reaches analytics, so it is not in here either.
 */
import { change, countOf, countRows, percent, rate, table, type Count } from './counts';

/** How the queries reach PostHog: the HogQL runner and the two shared filter parts of a report. */
export type QueryContext = {
  run: (query: string) => Promise<unknown[][]>;
  /** WHERE parts: both periods, live hosts only, no bots. */
  baseFilter: string;
  /** Boolean HogQL expression: the event is in the current period. */
  isNow: string;
};

const num = (value: unknown) => (typeof value === 'number' ? value : Number(value) || 0);

/** Counts per breakdown value for one event; `visitors` counts visitor-days instead of events. */
export async function countBreakdown(
  ctx: QueryContext,
  event: string,
  keyExpression: string,
  unit: 'events' | 'visitors' = 'events',
  where?: string,
): Promise<Count[]> {
  const visitorDay = `concat(distinct_id, '|', toString(toDate(timestamp)))`;
  const [nowExpr, beforeExpr] =
    unit === 'events'
      ? [`countIf(${ctx.isNow})`, `countIf(NOT (${ctx.isNow}))`]
      : [`uniqIf(${visitorDay}, ${ctx.isNow})`, `uniqIf(${visitorDay}, NOT (${ctx.isNow}))`];
  const rows = await ctx.run(
    `SELECT toString(${keyExpression}) AS k, ${nowExpr} AS now, ${beforeExpr} AS before
     FROM events WHERE event = '${event}' AND ${ctx.baseFilter}${where ? ` AND ${where}` : ''}
     GROUP BY k ORDER BY now DESC LIMIT 100`,
  );
  return rows.map(([key, now, before]) => ({ key: typeof key === 'string' ? key : '', now: num(now), before: num(before) }));
}

/** One count for an event (all rows added up). */
async function total(ctx: QueryContext, event: string, unit: 'events' | 'visitors' = 'events', where?: string): Promise<Count> {
  const rows = await countBreakdown(ctx, event, `'${event}'`, unit, where);
  return rows[0] ?? { key: event, now: 0, before: 0 };
}

export type SiteSearchData = {
  /** `search`: one per search, after the visitor stopped typing. */
  searches: Count;
  /** Visitor-days with a search. */
  searchers: Count;
  noResults: Count;
  /** `select_search_result` per resultType. */
  selections: Count[];
  /** `select_search_result` per "resultType · itemName" (public names of sticks, brands and articles). */
  selectedItems: Count[];
  /** Visitor-days with a search and a click to a shop that same day. */
  searchersWhoClicked: Count;
  /** `retailer_click` on a stick page that was opened from a search result. */
  clicksFromSearch: Count;
  clicksFromSearchByProduct: Count[];
  /** Stickwijzer started and completed after a click from the search (`source: search`). */
  wijzerStarts: Count;
  wijzerCompletes: Count;
};

export async function collectSiteSearch(ctx: QueryContext): Promise<SiteSearchData> {
  const fromSearch = `toString(properties.fromSearch) = 'true'`;
  const rows = await ctx.run(
    `SELECT countIf(isNow AND s > 0 AND k > 0), countIf(NOT isNow AND s > 0 AND k > 0) FROM (
       SELECT distinct_id, toDate(timestamp) AS day, max(${ctx.isNow}) AS isNow,
         countIf(event = 'search') AS s, countIf(event = 'retailer_click') AS k
       FROM events WHERE ${ctx.baseFilter}
       GROUP BY distinct_id, day
     )`,
  );
  const both = rows[0] ?? [];
  return {
    searches: await total(ctx, 'search'),
    searchers: await total(ctx, 'search', 'visitors'),
    noResults: await total(ctx, 'search_no_results'),
    selections: await countBreakdown(ctx, 'select_search_result', 'properties.resultType'),
    selectedItems: await countBreakdown(
      ctx,
      'select_search_result',
      `concat(toString(properties.resultType), ' · ', toString(properties.itemName))`,
    ),
    searchersWhoClicked: { key: 'searchersWhoClicked', now: num(both[0]), before: num(both[1]) },
    clicksFromSearch: await total(ctx, 'retailer_click', 'events', fromSearch),
    clicksFromSearchByProduct: await countBreakdown(
      ctx,
      'retailer_click',
      // Most product names already start with the brand ("Grays Grays JB 10").
      `if(startsWith(toString(properties.productName), toString(properties.brand)), toString(properties.productName), concat(toString(properties.brand), ' ', toString(properties.productName)))`,
      'events',
      fromSearch,
    ),
    wijzerStarts: await total(ctx, 'quiz_start', 'events', `toString(properties.source) = 'search'`),
    wijzerCompletes: await total(ctx, 'quiz_complete', 'events', `toString(properties.source) = 'search'`),
  };
}

export type BrandPagesData = {
  /** `brand_view` per brand. */
  views: Count[];
  /** `brand_stick_click` per brand: a click on a stick in the table. */
  clicks: Count[];
};

export async function collectBrandPages(ctx: QueryContext): Promise<BrandPagesData> {
  return {
    views: await countBreakdown(ctx, 'brand_view', 'properties.merk'),
    clicks: await countBreakdown(ctx, 'brand_stick_click', 'properties.merk'),
  };
}

export type VersusData = {
  /** `versus_view` per series. */
  views: Count[];
  /** `versus_retailer_click` per series. */
  clicks: Count[];
  /** `versus_retailer_click` per "series · shop". */
  clicksByRetailer: Count[];
};

export async function collectVersus(ctx: QueryContext): Promise<VersusData> {
  return {
    views: await countBreakdown(ctx, 'versus_view', 'properties.reeks'),
    clicks: await countBreakdown(ctx, 'versus_retailer_click', 'properties.reeks'),
    clicksByRetailer: await countBreakdown(ctx, 'versus_retailer_click', `concat(toString(properties.reeks), ' · ', toString(properties.retailer))`),
  };
}

// ---- Report text ----

const UNKNOWN = '_PostHog kon dit deze week niet beantwoorden._';

const RESULT_TYPE_LABELS: Record<string, string> = {
  stick: 'Stick',
  merk: 'Merk',
  kennisbank: 'Kennisbank of blog',
  stickwijzer: 'Stickwijzer',
  popular_suggestion: 'Populaire zoekopdracht',
};

/** Thresholds are low on purpose, like the rest of the report. */
export const SITE_THRESHOLDS = {
  /** Searches below which the share without results says nothing. */
  minSearches: 20,
  /** Share of searches without a result that is worth a signal. */
  noResultsShare: 0.3,
};

const row = (label: string, count: Count): string[] => [label, String(count.now), String(count.before), change(count.now, count.before)];
const shareRow = (label: string, part: Count, whole: Count): string[] => [
  label,
  percent(rate(part.now, whole.now)),
  percent(rate(part.before, whole.before)),
  '',
];

export function siteSearchSection(data: SiteSearchData | undefined, shopClicks: Count): string[] {
  if (!data) return [UNKNOWN];
  if (data.searches.now === 0 && data.searches.before === 0) return ['_Geen zoekacties in de header deze week of vorige week._'];
  return [
    table(
      ['', 'Deze week', 'Vorige week', 'Verschil'],
      [
        row('Zoekacties', data.searches),
        row('Bezoekers die zochten (per dag geteld)', data.searchers),
        row('Zoekacties zonder resultaat', data.noResults),
        shareRow('Aandeel zonder resultaat', data.noResults, data.searches),
        row('Bezoekers die zochten en die dag naar een winkel klikten', data.searchersWhoClicked),
        shareRow('Doorklikratio van wie zocht', data.searchersWhoClicked, data.searchers),
        row('Winkelkliks op een stick die via een zoekresultaat is geopend', data.clicksFromSearch),
        shareRow('Aandeel van alle winkelkliks', data.clicksFromSearch, shopClicks),
        row('Stickwijzer gestart vanuit zoeken', data.wijzerStarts),
        row('Stickwijzer afgerond vanuit zoeken', data.wijzerCompletes),
      ],
    ),
    '',
    '### Gekozen resultaat per type',
    '',
    table(['Type', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.selections, (key) => RESULT_TYPE_LABELS[key] ?? key)),
    '',
    '### Meest gekozen (top 10)',
    '',
    table(['Type · naam', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.selectedItems, (key) => key.replace(/^(\w+) · /, (_m, type: string) => `${RESULT_TYPE_LABELS[type] ?? type} · `))),
    '',
    '### Winkelkliks via zoeken, per stick (top 10)',
    '',
    table(['Stick', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksFromSearchByProduct)),
    '',
    '_Alleen aantallen: wat bezoekers typen wordt niet vastgelegd, ook niet bij "zonder resultaat". Een zoekactie is één zoekopdracht nadat het typen 800 ms stopte. "Via een zoekresultaat" betekent: de stickpagina is in dezelfde browsersessie vanuit het zoekvenster geopend. De Stickwijzer-cijfers tellen starts en afrondingen na een klik vanuit het zoekvenster (30 minuten geldig)._',
  ];
}

/** "now (before)" like the campaign table. */
const both = (count: Count) => `${count.now} (${count.before})`;

/** One row per key, with the counts of each list side by side; sorted by the first list. */
function sideBySide(first: readonly Count[], second: readonly Count[]): { key: string; first: Count; second: Count }[] {
  const keys = new Set([...first, ...second].filter((c) => c.key).map((c) => c.key));
  return [...keys]
    .map((key) => ({ key, first: countOf(first, key), second: countOf(second, key) }))
    .sort((a, b) => b.first.now - a.first.now || b.second.now - a.second.now || a.key.localeCompare(b.key, 'nl'));
}

export function brandPagesSection(data: BrandPagesData | undefined): string[] {
  if (!data) return [UNKNOWN];
  const rows = sideBySide(data.views, data.clicks);
  if (rows.length === 0) return ['_Geen bezoeken aan merkpagina\'s deze week of vorige week._'];
  return [
    table(
      ['Merk', 'Weergaven', 'Kliks op een stick', 'Doorklik'],
      rows.map((r) => [r.key, both(r.first), both(r.second), percent(rate(r.second.now, r.first.now))]),
    ),
    '',
    '_Deze week, met vorige week tussen haakjes. Doorklik = kliks op een stick in de tabel gedeeld door weergaven, deze week. Winkelkliks lopen via de stickpagina en staan bij "Kliks naar de winkels" (plek `productpagina`)._',
  ];
}

export function versusSection(data: VersusData | undefined): string[] {
  if (!data) return [UNKNOWN];
  const rows = sideBySide(data.views, data.clicks);
  if (rows.length === 0) return ['_Geen bezoeken aan reekspagina\'s deze week of vorige week._'];
  return [
    table(
      ['Reeks', 'Weergaven', 'Winkelkliks', 'Klikratio'],
      rows.map((r) => [r.key, both(r.first), both(r.second), percent(rate(r.second.now, r.first.now))]),
    ),
    '',
    'Per reeks en winkel:',
    '',
    table(['Reeks · winkel', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksByRetailer)),
    '',
    '_Deze week, met vorige week tussen haakjes. Klikratio = winkelkliks gedeeld door weergaven, deze week._',
  ];
}

/** Signals about the search, for the "Signalen" list of the report. */
export function siteSearchSignals(data: SiteSearchData | undefined): string[] {
  if (!data) return [];
  const share = rate(data.noResults.now, data.searches.now);
  if (data.searches.now >= SITE_THRESHOLDS.minSearches && share !== null && share >= SITE_THRESHOLDS.noResultsShare) {
    return [
      `**Veel zoekacties zonder resultaat:** ${percent(share)} (${data.noResults.now} van ${data.searches.now}). De getypte tekst wordt niet vastgelegd; kijk of er synoniemen of correcties in \`src/search/search-config.json\` ontbreken, of modellen in de catalogus.`,
    ];
  }
  return [];
}
