/**
 * Monthly SEO opportunity report: pure functions on Search Console rows. No
 * network, no catalog import (the offer is looked up through a callback), so it
 * is tested with synthetic data. The API calls and the sealing live in
 * scripts/seo-opportunities.ts. Design: docs/seo-market-intelligence-plan.md.
 *
 * Deliberately not here: a weighted total score (the owner reads the reasons),
 * search volumes (Search Console has impressions, Google Trends only an index)
 * and a decision to publish anything (a person approves with a label).
 */
import { z } from 'zod';
import { LOW_CTR, NEAR_PAGE_ONE, type Period, type SearchRow } from './searchConsole';
import { INTENT_WORDS, SEASON_NOTE, SEO_BRAND_TERMS, THRESHOLDS, type BrandTerms } from './seoConfig';

export const SEO_RULESET_VERSION = 'seo-kansen-v1';

export type BrandClass = 'eigen' | 'merkwoord' | 'niet-merk';
export type PageType = 'home' | 'product' | 'catalogus' | 'kennis' | 'blog' | 'merk' | 'vergelijk' | 'tool' | 'schoen' | 'overig';
export type Intent = 'kopen' | 'vergelijken' | 'informatie' | 'product' | 'onbekend';
/** What our own site offers for a query, from the live search ('categorie': only general words, such as "hockeystick kopen"). */
export type OfferKind = 'stick' | 'merk' | 'artikel' | 'tool' | 'categorie' | 'geen';
export type OfferMatch = { kind: OfferKind; path: string | null };
export type ActionCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Level = 'hoog' | 'middel' | 'laag';

export const ACTION_LABELS: Record<ActionCode, string> = {
  A: 'Bestaande pagina verbeteren',
  B: 'Interne links versterken',
  C: 'Nieuwe kenniscontent',
  D: 'Vergelijker of productpresentatie verbeteren',
  E: 'Geen websiteactie, alleen social',
  F: 'Geen actie',
};

// ---------------------------------------------------------------- Schema

const Baseline = z.object({ positie: z.number(), vertoningen: z.number(), klikken: z.number() });
const Period_ = z.object({ start: z.string(), end: z.string() });
const Totals_ = z.object({ klikken: z.number(), vertoningen: z.number(), zoektermen: z.number() });

export const Recommendation = z.object({
  id: z.string(),
  code: z.enum(['A', 'B', 'C', 'D']),
  pagina: z.string(),
  paginaType: z.string(),
  zoektermen: z.array(z.string()).max(3),
  /** In words only: this text also goes into a public issue, so it holds no figures. */
  reden: z.string(),
  prioriteit: z.enum(['hoog', 'middel', 'laag']),
  zekerheid: z.enum(['hoog', 'middel', 'laag']),
  basislijn: Baseline,
});
export type Recommendation = z.infer<typeof Recommendation>;

export const Skipped = z.object({ zoekterm: z.string(), code: z.enum(['E', 'F']), reden: z.string() });
export type Skipped = z.infer<typeof Skipped>;

export const BrandWord = z.object({
  zoekterm: z.string(),
  klikken: z.number(),
  vertoningen: z.number(),
  positie: z.number(),
  vorigeVertoningen: z.number(),
});
export type BrandWord = z.infer<typeof BrandWord>;

export const HistoryMonth = z.object({
  maand: z.string(),
  aanbevelingen: z.array(
    z.object({ id: z.string(), code: z.string(), pagina: z.string(), zoekterm: z.string(), basislijn: Baseline }),
  ),
});
export type HistoryMonth = z.infer<typeof HistoryMonth>;

export const SeoReport = z.object({
  versie: z.literal(1),
  regelset: z.string(),
  gemaakt: z.string(),
  maand: z.string().regex(/^\d{4}-\d{2}$/),
  land: z.string(),
  periode: Period_,
  vorige: Period_,
  samenvatting: z.object({ eigen: Totals_, merkwoorden: Totals_, nietMerk: Totals_, onvoldoende: z.number() }),
  aanbevelingen: z.array(Recommendation).max(THRESHOLDS.maxRecommendations),
  bewustNiet: z.array(Skipped).max(THRESHOLDS.maxSkipped),
  merkwoorden: z.array(BrandWord),
  seizoenNotitie: z.string(),
  historie: z.array(HistoryMonth),
});
export type SeoReport = z.infer<typeof SeoReport>;

// ---------------------------------------------------------------- Rows

export type PageStat = { page: string; impressions: number; clicks: number; position: number };
export type QueryStat = { query: string; clicks: number; impressions: number; position: number; pages: PageStat[] };

export const normalizeQuery = (query: string) => query.toLowerCase().replace(/\s+/g, ' ').trim();

/** The path of a page URL, without a trailing slash. */
export function pagePath(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    return path === '' ? '/' : path;
  } catch {
    return url;
  }
}

/** One entry per query (lowercase), with its pages sorted by impressions; positions are impression-weighted. */
export function aggregate(rows: readonly SearchRow[]): Map<string, QueryStat> {
  type Acc = { query: string; clicks: number; impressions: number; weighted: number; pages: Map<string, { clicks: number; impressions: number; weighted: number }> };
  const byQuery = new Map<string, Acc>();
  for (const row of rows) {
    const query = normalizeQuery(row.query);
    if (!query) continue;
    const acc = byQuery.get(query) ?? { query, clicks: 0, impressions: 0, weighted: 0, pages: new Map() };
    byQuery.set(query, acc);
    acc.clicks += row.clicks;
    acc.impressions += row.impressions;
    acc.weighted += row.position * row.impressions;
    const page = pagePath(row.page);
    const stat = acc.pages.get(page) ?? { clicks: 0, impressions: 0, weighted: 0 };
    acc.pages.set(page, stat);
    stat.clicks += row.clicks;
    stat.impressions += row.impressions;
    stat.weighted += row.position * row.impressions;
  }
  const result = new Map<string, QueryStat>();
  for (const acc of byQuery.values()) {
    const pages = [...acc.pages].map(([page, s]) => ({
      page,
      clicks: s.clicks,
      impressions: s.impressions,
      position: s.impressions > 0 ? s.weighted / s.impressions : 0,
    }));
    pages.sort((a, b) => b.impressions - a.impressions || a.page.localeCompare(b.page));
    result.set(acc.query, {
      query: acc.query,
      clicks: acc.clicks,
      impressions: acc.impressions,
      position: acc.impressions > 0 ? acc.weighted / acc.impressions : 0,
      pages,
    });
  }
  return result;
}

// ---------------------------------------------------------------- Classification

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const wordsOf = (text: string) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** Does the query hold the term, written with or without spaces, with a typing error allowed in long terms? */
function holdsTerm(queryWords: readonly string[], term: string): boolean {
  const wanted = squash(term);
  if (!wanted) return false;
  for (let size = 1; size <= 3; size += 1) {
    for (let start = 0; start + size <= queryWords.length; start += 1) {
      const window = queryWords.slice(start, start + size).join('');
      if (window === wanted) return true;
      if (wanted.length >= 8 && Math.abs(window.length - wanted.length) <= 1 && editDistance(window, wanted) <= 1) return true;
    }
  }
  return false;
}

export function classifyBrand(query: string, terms: BrandTerms = SEO_BRAND_TERMS): BrandClass {
  const words = wordsOf(query);
  if (terms.eigen.some((term) => holdsTerm(words, term))) return 'eigen';
  if (terms.merkwoorden.some((term) => holdsTerm(words, term))) return 'merkwoord';
  return 'niet-merk';
}

export function pageType(path: string): PageType {
  if (path === '/') return 'home';
  const [first = ''] = path.split('/').filter(Boolean);
  switch (first) {
    case 'sticks':
      return path === '/sticks' ? 'catalogus' : 'product';
    case 'zaalsticks':
      return 'catalogus';
    case 'aanbod':
      return 'product';
    case 'kennis':
      return 'kennis';
    case 'blog':
      return 'blog';
    case 'merken':
      return 'merk';
    case 'vergelijk':
      return 'vergelijk';
    case 'stickwijzer':
      return 'tool';
    case 'hockeyschoenen':
      return 'schoen';
    default:
      return 'overig';
  }
}

export function intentOf(query: string, offer: OfferMatch): Intent {
  const words = new Set(wordsOf(query));
  const has = (list: readonly string[]) => list.some((word) => words.has(word));
  if (has(INTENT_WORDS.kopen)) return 'kopen';
  if (has(INTENT_WORDS.vergelijken)) return 'vergelijken';
  if (has(INTENT_WORDS.informatie)) return 'informatie';
  return offer.kind === 'stick' || offer.kind === 'merk' ? 'product' : 'onbekend';
}

// ---------------------------------------------------------------- Decision per query

type Decision = {
  code: ActionCode;
  page: string;
  reden: string;
};

/** The reason of a query that needs no action; those queries are not listed. */
export const NO_ACTION_REASON = 'Geen aanleiding voor een actie.';

const INFO_PAGES: readonly PageType[] = ['kennis', 'blog'];
const CHOOSE_PAGES: readonly PageType[] = ['product', 'catalogus', 'merk', 'vergelijk'];

/** The share of impressions the second page of a query takes over the long period. */
function cannibalised(long: QueryStat | undefined): boolean {
  const [first, second] = long?.pages ?? [];
  if (!long || !first || !second) return false;
  return (
    second.impressions >= THRESHOLDS.cannibalMinImpressions &&
    second.impressions / long.impressions >= THRESHOLDS.cannibalMinShare
  );
}

export type DecisionInput = {
  now: QueryStat;
  before: QueryStat | undefined;
  long: QueryStat | undefined;
  offer: OfferMatch;
};

/** One deterministic decision per non-brand query with enough data. Order of the rules matters. */
export function decide({ now, before, long, offer }: DecisionInput): Decision {
  const top = now.pages[0]?.page ?? '/';
  const type = pageType(top);
  const intent = intentOf(now.query, offer);
  const comparable = !!before && before.impressions >= THRESHOLDS.minImpressions;
  const delta = comparable && before ? now.position - before.position : null;
  const nearOne = now.position >= NEAR_PAGE_ONE.minPosition && now.position <= NEAR_PAGE_ONE.maxPosition;

  if (offer.kind === 'geen') {
    if (intent === 'informatie') {
      return { code: 'C', page: '/kennis', reden: 'Een informatievraag waar de site nog geen passende pagina voor heeft.' };
    }
    if (intent === 'kopen') {
      return { code: 'F', page: top, reden: 'Geen passend product in de catalogus. Of we dit gaan aanbieden is een besluit van de eigenaar.' };
    }
    return { code: 'E', page: top, reden: 'Een zoekopdracht buiten ons aanbod. Hooguit iets voor social, niet voor de site.' };
  }
  if (cannibalised(long)) {
    return {
      code: 'B',
      page: top,
      reden: 'Twee pagina\'s concurreren om dezelfde zoekopdracht. Kies een hoofdpagina en verwijs er vanaf de andere pagina met een interne link naartoe.',
    };
  }
  if (delta !== null && delta >= THRESHOLDS.positionWorse) {
    return {
      code: 'A',
      page: top,
      reden: 'De positie is verslechterd ten opzichte van de periode ervoor. Vergelijk de pagina met een eerdere versie voordat je iets verandert.',
    };
  }
  if (nearOne) {
    if (intent === 'informatie' && !INFO_PAGES.includes(type)) {
      if ((offer.kind === 'artikel' || offer.kind === 'tool') && offer.path && offer.path !== top) {
        return {
          code: 'B',
          page: offer.path,
          reden: 'Er is een passende pagina, maar de zoekmachine toont een andere. Versterk de passende pagina met interne links vanaf de pagina die nu wordt getoond.',
        };
      }
      return { code: 'C', page: '/kennis', reden: 'Een informatievraag die op een pagina landt die er niet voor bedoeld is. Een kennispagina kan hem beter beantwoorden.' };
    }
    if ((intent === 'kopen' || intent === 'vergelijken' || intent === 'product') && !CHOOSE_PAGES.includes(type)) {
      return {
        code: 'D',
        page: top,
        reden: 'De bezoeker wil kiezen of kopen, maar landt op een pagina die daar niet voor bedoeld is. Laat een vergelijker of productpagina die rol overnemen.',
      };
    }
    return { code: 'A', page: top, reden: 'De pagina staat net buiten de eerste resultaten. Verbeter titel, kopjes en inleiding op deze zoekopdracht.' };
  }
  if (now.position <= LOW_CTR.maxPosition && now.impressions >= LOW_CTR.minImpressions && now.clicks / now.impressions < LOW_CTR.maxCtr) {
    return { code: 'A', page: top, reden: 'Hoge positie maar weinig kliks. Titel en omschrijving overtuigen mogelijk niet.' };
  }
  return { code: 'F', page: top, reden: NO_ACTION_REASON };
}

/** "hoog" needs enough impressions in both periods; "laag" is a first signal only. */
export function confidenceOf(now: QueryStat, before: QueryStat | undefined): Level {
  const comparable = !!before && before.impressions >= THRESHOLDS.minImpressions;
  if (now.impressions >= THRESHOLDS.strongImpressions && comparable) return 'hoog';
  if (now.impressions >= THRESHOLDS.strongImpressions || comparable) return 'middel';
  return 'laag';
}

/** FNV-1a: a short, stable id for a recommendation (not for security). */
export function shortId(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------- Report

export type AnalysisInput = {
  month: string;
  now: Date;
  period: Period;
  previousPeriod: Period;
  current: readonly SearchRow[];
  previous: readonly SearchRow[];
  /** About 90 days, ending at the same day: used for cannibalisation only. */
  long: readonly SearchRow[];
  offerOf: (query: string) => OfferMatch;
  history?: readonly HistoryMonth[];
  terms?: BrandTerms;
};

const CODE_ORDER: Record<ActionCode, number> = { A: 0, B: 1, D: 2, C: 3, E: 4, F: 5 };
const LEVEL_ORDER: Record<Level, number> = { hoog: 0, middel: 1, laag: 2 };

const totalsOf = (stats: readonly QueryStat[]) => ({
  klikken: stats.reduce((sum, s) => sum + s.clicks, 0),
  vertoningen: stats.reduce((sum, s) => sum + s.impressions, 0),
  zoektermen: stats.length,
});

export function analyse(input: AnalysisInput): SeoReport {
  const terms = input.terms ?? SEO_BRAND_TERMS;
  const now = aggregate(input.current);
  const before = aggregate(input.previous);
  const long = aggregate(input.long);

  const eigen: QueryStat[] = [];
  const brandWords: QueryStat[] = [];
  const nonBrand: QueryStat[] = [];
  for (const stat of now.values()) {
    const kind = classifyBrand(stat.query, terms);
    (kind === 'eigen' ? eigen : kind === 'merkwoord' ? brandWords : nonBrand).push(stat);
  }

  const enough = nonBrand.filter((stat) => stat.impressions >= THRESHOLDS.minImpressions);
  const insufficient = nonBrand.length - enough.length;

  // Priority is qualitative: the top third of the queries by impressions is "hoog", the next third "middel".
  const ranked = [...enough].sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query));
  const priorityOf = (query: string): Level => {
    const index = ranked.findIndex((stat) => stat.query === query);
    const third = Math.max(1, Math.ceil(ranked.length / 3));
    return index < third ? 'hoog' : index < 2 * third ? 'middel' : 'laag';
  };

  type Hit = { stat: QueryStat; decision: Decision };
  const hits: Hit[] = ranked.map((stat) => ({
    stat,
    decision: decide({ now: stat, before: before.get(stat.query), long: long.get(stat.query), offer: input.offerOf(stat.query) }),
  }));

  // Group the actionable decisions per page and code: one recommendation per page and action.
  const groups = new Map<string, Hit[]>();
  for (const hit of hits) {
    if (hit.decision.code === 'E' || hit.decision.code === 'F') continue;
    // New content is one recommendation per question; the other actions are one per page.
    const key = hit.decision.code === 'C' ? `C|${hit.stat.query}` : `${hit.decision.code}|${hit.decision.page}`;
    groups.set(key, [...(groups.get(key) ?? []), hit]);
  }
  const recommendations: Recommendation[] = [...groups.values()].map((members) => {
    const lead = members[0] as Hit; // `ranked` is sorted by impressions, so the first is the largest.
    const { code, page, reden } = lead.decision;
    return {
      id: shortId(code === 'C' ? `C|${lead.stat.query}` : `${code}|${page}`),
      code: code as Recommendation['code'],
      pagina: page,
      paginaType: pageType(page),
      zoektermen: members.slice(0, 3).map((member) => member.stat.query),
      reden,
      prioriteit: priorityOf(lead.stat.query),
      zekerheid: confidenceOf(lead.stat, before.get(lead.stat.query)),
      basislijn: {
        positie: Math.round(lead.stat.position * 10) / 10,
        vertoningen: lead.stat.impressions,
        klikken: lead.stat.clicks,
      },
    };
  });
  const impressionsOf = (rec: Recommendation) => rec.basislijn.vertoningen;
  recommendations.sort(
    (a, b) =>
      LEVEL_ORDER[a.prioriteit] - LEVEL_ORDER[b.prioriteit] ||
      CODE_ORDER[a.code] - CODE_ORDER[b.code] || // existing pages first (A, B, D), then new content (C)
      impressionsOf(b) - impressionsOf(a) ||
      a.pagina.localeCompare(b.pagina),
  );

  const skipped: Skipped[] = hits
    .filter((hit) => hit.decision.code === 'E' || hit.decision.code === 'F')
    .filter((hit) => hit.decision.reden !== NO_ACTION_REASON)
    .slice(0, THRESHOLDS.maxSkipped)
    .map((hit) => ({ zoekterm: hit.stat.query, code: hit.decision.code as 'E' | 'F', reden: hit.decision.reden }));

  const brandWordRows: BrandWord[] = [...brandWords]
    .sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query))
    .slice(0, THRESHOLDS.maxBrandWords)
    .map((stat) => ({
      zoekterm: stat.query,
      klikken: stat.clicks,
      vertoningen: stat.impressions,
      positie: Math.round(stat.position * 10) / 10,
      vorigeVertoningen: before.get(stat.query)?.impressions ?? 0,
    }));

  const top = recommendations.slice(0, THRESHOLDS.maxRecommendations);
  return SeoReport.parse({
    versie: 1,
    regelset: SEO_RULESET_VERSION,
    gemaakt: input.now.toISOString(),
    maand: input.month,
    land: 'nld',
    periode: input.period,
    vorige: input.previousPeriod,
    samenvatting: {
      eigen: totalsOf(eigen),
      merkwoorden: totalsOf(brandWords),
      nietMerk: totalsOf(nonBrand),
      onvoldoende: insufficient,
    },
    aanbevelingen: top,
    bewustNiet: skipped,
    merkwoorden: brandWordRows,
    seizoenNotitie: SEASON_NOTE,
    historie: nextHistory(input.history ?? [], input.month, top),
  });
}

/** Adds this month to the history, replaces a run of the same month, and keeps the last twelve months. */
export function nextHistory(
  history: readonly HistoryMonth[],
  month: string,
  recommendations: readonly Recommendation[],
): HistoryMonth[] {
  const entry: HistoryMonth = {
    maand: month,
    aanbevelingen: recommendations.map((rec) => ({
      id: rec.id,
      code: rec.code,
      pagina: rec.pagina,
      zoekterm: rec.zoektermen[0] ?? '',
      basislijn: rec.basislijn,
    })),
  };
  return [...history.filter((h) => h.maand !== month), entry]
    .sort((a, b) => a.maand.localeCompare(b.maand))
    .slice(-THRESHOLDS.historyMonths);
}

/**
 * The only line the monthly script prints. A public repository has public workflow
 * logs, so it holds no figure, query or page: just that the sealed report exists.
 */
export const statusLine = (report: SeoReport): string => `SEO-kansenrapport ${report.maand} gemaakt en versleuteld.`;
