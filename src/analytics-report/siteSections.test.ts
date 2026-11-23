import { describe, expect, it } from 'vitest';
import { formatReport, signals, type ConversionData } from './conversion';
import {
  brandPagesSection,
  collectBrandPages,
  collectSiteSearch,
  collectVersus,
  countBreakdown,
  siteSearchSection,
  siteSearchSignals,
  versusSection,
  type QueryContext,
  type SiteSearchData,
} from './siteSections';
import type { Count } from './counts';

const c = (key: string, now: number, before = 0): Count => ({ key, now, before });

/** A runner that records the queries and answers each one from a list of canned rows. */
function recorder(answers: unknown[][][] = []) {
  const queries: string[] = [];
  let i = 0;
  const ctx: QueryContext = {
    baseFilter: 'BASE',
    isNow: 'ISNOW',
    run: async (query) => {
      queries.push(query);
      return answers[i++] ?? [];
    },
  };
  return { ctx, queries };
}

const search = (overrides: Partial<SiteSearchData> = {}): SiteSearchData => ({
  searches: c('search', 120, 80),
  searchers: c('search', 90, 60),
  noResults: c('search_no_results', 12, 8),
  selections: [c('stick', 50, 30), c('kennisbank', 20, 10), c('stickwijzer', 6, 2), c('popular_suggestion', 9, 4)],
  selectedItems: [c('stick · Grays JB 10 Composite Hockey Stick', 14, 9), c('kennisbank · Hoeveel carbon heeft je hockeystick nodig?', 7, 3)],
  searchersWhoClicked: c('x', 18, 9),
  clicksFromSearch: c('retailer_click', 25, 12),
  clicksFromSearchByProduct: [c('Grays JB 10 Composite Hockey Stick', 11, 5)],
  wijzerStarts: c('quiz_start', 6, 2),
  wijzerCompletes: c('quiz_complete', 3, 1),
  ...overrides,
});

describe('countBreakdown', () => {
  it('counts events per key for both periods and can add a filter', async () => {
    const { ctx, queries } = recorder([[['stick', 5, 3], [null, 1, 0]]]);
    const rows = await countBreakdown(ctx, 'select_search_result', 'properties.resultType', 'events', `toString(properties.x) = 'y'`);
    expect(rows).toEqual([c('stick', 5, 3), c('', 1, 0)]);
    expect(queries[0]).toContain(`event = 'select_search_result'`);
    expect(queries[0]).toContain('countIf(ISNOW)');
    expect(queries[0]).toContain(`AND BASE AND toString(properties.x) = 'y'`);
  });

  it('counts visitor-days when asked', async () => {
    const { ctx, queries } = recorder([[['search', 4, 2]]]);
    await countBreakdown(ctx, 'search', `'search'`, 'visitors');
    expect(queries[0]).toContain('uniqIf(concat(distinct_id');
  });
});

describe('collectors', () => {
  it('asks for the right events and properties, and never for the typed text', async () => {
    const { ctx, queries } = recorder();
    await collectSiteSearch(ctx);
    const all = queries.join('\n');
    for (const event of ['search', 'search_no_results', 'select_search_result', 'retailer_click', 'quiz_start', 'quiz_complete']) {
      expect(all).toContain(`'${event}'`);
    }
    expect(all).toContain(`toString(properties.fromSearch) = 'true'`);
    expect(all).toContain(`toString(properties.source) = 'search'`);
    expect(all).not.toMatch(/queryText|searchTerm|search_term/);
  });

  it('reads the brand and series events', async () => {
    const brand = recorder([[['Grays', 12, 4]], [['Grays', 5, 1]]]);
    expect(await collectBrandPages(brand.ctx)).toEqual({ views: [c('Grays', 12, 4)], clicks: [c('Grays', 5, 1)] });
    expect(brand.queries[0]).toContain(`'brand_view'`);
    expect(brand.queries[1]).toContain(`'brand_stick_click'`);
    const versus = recorder([[['grays-jb-serie', 20, 0]], [['grays-jb-serie', 6, 0]], [['grays-jb-serie · bol.com', 3, 0]]]);
    const data = await collectVersus(versus.ctx);
    expect(data.views[0]?.key).toBe('grays-jb-serie');
    expect(data.clicksByRetailer[0]?.key).toBe('grays-jb-serie · bol.com');
    expect(versus.queries.join('\n')).toContain(`'versus_retailer_click'`);
  });
});

describe('report text', () => {
  it('shows the search figures with shares, and the choices per type in words', () => {
    const text = siteSearchSection(search(), c('retailer_click', 100, 60)).join('\n');
    expect(text).toContain('| Zoekacties | 120 | 80 | +50% |');
    expect(text).toContain('| Aandeel zonder resultaat | 10% | 10% |  |');
    expect(text).toContain('| Doorklikratio van wie zocht | 20% | 15% |  |');
    expect(text).toContain('| Aandeel van alle winkelkliks | 25% | 20% |  |');
    expect(text).toContain('| Stickwijzer gestart vanuit zoeken | 6 | 2 | +200% |');
    expect(text).toContain('| Stick | 50 | 30 |');
    expect(text).toContain('| Populaire zoekopdracht | 9 | 4 |');
    expect(text).toContain('Stick · Grays JB 10 Composite Hockey Stick');
    expect(text).toContain('Kennisbank of blog · Hoeveel carbon');
    expect(text).toContain('wat bezoekers typen wordt niet vastgelegd');
  });

  it('says so when there were no searches, and when PostHog could not answer', () => {
    const none = search({ searches: c('search', 0, 0) });
    expect(siteSearchSection(none, c('retailer_click', 0)).join(' ')).toContain('Geen zoekacties');
    expect(siteSearchSection(undefined, c('retailer_click', 0))).toEqual(['_PostHog kon dit deze week niet beantwoorden._']);
    expect(brandPagesSection(undefined)).toEqual(['_PostHog kon dit deze week niet beantwoorden._']);
    expect(versusSection(undefined)).toEqual(['_PostHog kon dit deze week niet beantwoorden._']);
  });

  it('puts views, clicks and the click-through of a brand page side by side', () => {
    const text = brandPagesSection({ views: [c('Grays', 40, 10), c('Brabo', 8, 0)], clicks: [c('Grays', 10, 2)] }).join('\n');
    expect(text).toContain('| Grays | 40 (10) | 10 (2) | 25% |');
    expect(text).toContain('| Brabo | 8 (0) | 0 (0) | 0% |');
  });

  it('puts views and shop clicks of a series side by side, with the clicks per shop', () => {
    const text = versusSection({ views: [c('grays-jb-serie', 30, 0)], clicks: [c('grays-jb-serie', 6, 0)], clicksByRetailer: [c('grays-jb-serie · bol.com', 4, 0)] }).join('\n');
    expect(text).toContain('| grays-jb-serie | 30 (0) | 6 (0) | 20% |');
    expect(text).toContain('| grays-jb-serie · bol.com | 4 | 0 | nieuw |');
  });

  it('signals many searches without a result, only from 20 searches', () => {
    expect(siteSearchSignals(search({ searches: c('s', 100), noResults: c('n', 35) }))[0]).toContain('35%');
    expect(siteSearchSignals(search({ searches: c('s', 100), noResults: c('n', 10) }))).toEqual([]);
    expect(siteSearchSignals(search({ searches: c('s', 10), noResults: c('n', 9) }))).toEqual([]);
    expect(siteSearchSignals(undefined)).toEqual([]);
  });
});

describe('the whole report', () => {
  const base: ConversionData = {
    current: { start: '2026-11-17', end: '2026-11-23' },
    previous: { start: '2026-11-10', end: '2026-11-16' },
    events: [c('$pageview', 1000, 800), c('retailer_click', 100, 60)],
    funnel: [c('visitors', 400, 350), c('started', 100, 100), c('route', 90, 90), c('completed', 60, 60), c('clicked', 20, 15), c('clickers', 28, 20)],
    questions: [],
    questionsByRoute: [],
    adviceByRoute: [],
    adviceOutcomes: [c('match', 55)],
    feedback: [],
    clicksByPlacement: [],
    clicksByLinkType: [],
    clicksByRetailer: [],
    clicksByProduct: [],
    clicksByPage: [],
    pageviewsByPage: [],
    visitorsByReferrer: [],
    homeBlocks: [],
    deadClicksByPage: [],
    deadClicksByElement: [],
    rageClicksByPage: [],
    otherHostEvents: 0,
  };

  it('has the three new sections in a stable place, after the clicks to the shops', () => {
    const text = formatReport({ ...base, siteSearch: search(), brandPages: { views: [c('Grays', 4)], clicks: [] }, versus: { views: [c('x', 1)], clicks: [], clicksByRetailer: [] } }, []);
    const order = ['## Kliks naar de winkels', '## Zoeken in de header', "## Merkpagina's", "## Reekspagina's (vergelijken)", "## Meest bekeken pagina's (top 10)"].map((h) => text.indexOf(h));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('still works when PostHog could not answer the new questions', () => {
    const text = formatReport(base, []);
    expect(text).toContain('## Zoeken in de header');
    const part = text.slice(text.indexOf('## Zoeken in de header'), text.indexOf("## Meest bekeken pagina's"));
    expect(part.match(/PostHog kon dit deze week niet beantwoorden/g)?.length).toBe(3);
  });

  it('adds the search signal to the signals list', () => {
    const found = signals({ ...base, siteSearch: search({ searches: c('s', 100), noResults: c('n', 40) }) }, []);
    expect(found.some((line) => line.includes('Veel zoekacties zonder resultaat'))).toBe(true);
  });

  it('keeps the house style: no em dashes in the new texts, no exclamation marks', () => {
    const text = formatReport({ ...base, siteSearch: search(), brandPages: { views: [c('Grays', 4)], clicks: [] }, versus: { views: [c('x', 1)], clicks: [], clicksByRetailer: [] } }, []);
    const part = text.slice(text.indexOf('## Zoeken in de header'), text.indexOf("## Meest bekeken pagina's"));
    expect(part).not.toMatch(/—|!/);
  });
});
