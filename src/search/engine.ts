import type { SearchConfig } from './config';
import { MAX_QUERY_LENGTH, searchTokens } from './tokens';

/**
 * The matcher of the live search in the header. Pure functions on a prepared
 * index, so it runs in the browser (no catalog import) and is tested without
 * one. The order of results follows the visitor's intent to buy, not any
 * fee: sticks first, then brands, then articles (owner brief, 2026-11-24).
 */

export type SearchItemType = 'stick' | 'brand' | 'article';

export type StickPrice = {
  /** Lowest current total (price plus shipping) at a shop with the stick in stock, when there was one at build time. */
  shopEur?: number;
  /** Shops with a current price at build time. */
  shopCount?: number;
  /** YYYY-MM-DD: the oldest read date among those shops. The browser re-checks the 14 days. */
  readAt?: string;
  /** The manufacturer's or a shop's indicative price; shown as an indicative price only. */
  indicativeEur?: number | null;
};

export type SearchItem = {
  type: SearchItemType;
  id: string;
  title: string;
  path: string;
  /** More words to find it by, after the title (an article's headings). */
  keywords?: string;
  /** Sticks: the brand, carbon percentage, bow, photo and price. */
  brand?: string;
  carbon?: number | null;
  bow?: string;
  image?: string;
  price?: StickPrice;
  /** Brands: whether the brand has its own page under /merken/<merk>, and how many sticks we list. */
  hasPage?: boolean;
  stickCount?: number;
  /** Articles: "Kennisbank" or "Blog", and the meta description. */
  category?: string;
  summary?: string;
};

export type SearchIndex = {
  /** ISO time the index was built; the browser judges the age of prices by it. */
  generatedAt: string;
  items: SearchItem[];
};

type PreparedItem = {
  item: SearchItem;
  titleTokens: string[];
  titleSet: Set<string>;
  /** Title and keywords, with the joined neighbours ("low" + "bow" = "lowbow"). */
  allSet: Set<string>;
};

export type PreparedIndex = { generatedAt: string; items: PreparedItem[] };

/** Every token plus each pair of neighbours written together, so "low bow" and "lowbow" are the same. */
function withJoined(tokens: readonly string[]): Set<string> {
  const set = new Set(tokens);
  for (let i = 0; i < tokens.length - 1; i += 1) set.add(`${tokens[i]}${tokens[i + 1]}`);
  return set;
}

export function prepareIndex(index: SearchIndex): PreparedIndex {
  return {
    generatedAt: index.generatedAt,
    items: index.items.map((item) => {
      const titleText = item.type === 'stick' && item.brand && !item.title.toLowerCase().startsWith(item.brand.toLowerCase()) ? `${item.brand} ${item.title}` : item.title;
      const titleTokens = searchTokens(titleText);
      const allTokens = searchTokens(`${titleText} ${item.keywords ?? ''}`);
      return { item, titleTokens, titleSet: withJoined(titleTokens), allSet: withJoined(allTokens) };
    }),
  };
}

/**
 * A query word matches a word that starts with it. A number, or a word that ends
 * in one ("midbow5", two typed words joined), must match whole: "5" is not "500".
 */
function tokenMatches(token: string, words: ReadonlySet<string>): boolean {
  if (/\d$/.test(token)) return words.has(token);
  for (const word of words) if (word.startsWith(token)) return true;
  return false;
}

/** The words that count as the same as `token`: itself, its correction and the synonyms of both. */
function alternatives(token: string, config: SearchConfig): string[] {
  const corrected = config.corrections[token] ?? token;
  const result = new Set([token, corrected]);
  for (const group of config.synonyms) {
    if (group.terms.includes(token) || group.terms.includes(corrected)) for (const term of group.terms) result.add(term);
  }
  return [...result];
}

/** The ways to read the typed words: as typed, and with one pair of neighbours joined ("low bow" as "lowbow"). */
function readings(tokens: readonly string[]): string[][] {
  const all = [tokens.slice()];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    all.push([...tokens.slice(0, i), `${tokens[i]}${tokens[i + 1]}`, ...tokens.slice(i + 2)]);
  }
  return all;
}

/** Every typed word with its synonyms and corrections, plus each two neighbours joined ("low" + "bow" = "lowbow"). */
function knownWords(tokens: readonly string[], config: SearchConfig): Set<string> {
  const words = new Set<string>();
  for (const reading of readings(tokens)) for (const token of reading) for (const option of alternatives(token, config)) words.add(option);
  return words;
}

/**
 * Words that describe a stick but do not name a model ("low bow", "carbon", "junior"):
 * a search made of these alone is a question about a kind of stick, never an exact model match.
 */
const GENERIC = new Set([
  'low', 'mid', 'pro', 'bow', 'lowbow', 'midbow', 'probow', 'dynabow', 'ultrabow', 'jumbow',
  'carbon', 'junior', 'senior', 'indoor', 'outdoor', 'stick', 'hockey', 'composite', 'kinderen',
]);

export type Scored = { item: SearchItem; score: number; exact: boolean };

/** 70% relevance, 20% exact match, 10% for a title that starts with the first word. No popularity part in version 1. */
const WEIGHT_RELEVANCE = 0.7;
const WEIGHT_EXACT = 0.2;
const WEIGHT_START = 0.1;

function scoreItem(prepared: PreparedItem, query: readonly string[], config: SearchConfig): Scored | null {
  // Brands match on their name only: "grays jb10" is a stick, not the brand.
  const pool = prepared.item.type === 'brand' ? prepared.titleSet : prepared.allSet;
  let best: Scored | null = null;
  for (const reading of readings(query)) {
    const optionsPerToken = reading.map((token) => alternatives(token, config));
    const matchedTitle = optionsPerToken.map((options) => options.some((option) => tokenMatches(option, prepared.titleSet)));
    const matchedAny = optionsPerToken.map((options) => options.some((option) => tokenMatches(option, pool)));
    if (!matchedAny.every(Boolean)) continue;
    const relevance = reading.reduce((sum, _token, i) => sum + (matchedTitle[i] ? 1 : 0.5), 0) / reading.length;
    // Exact: at least two typed words, each one a whole word of the title (the model, not just the brand).
    const exact =
      prepared.item.type !== 'article' &&
      reading.length >= 2 &&
      reading.some((token) => !GENERIC.has(token)) &&
      reading.every((token, i) => optionsPerToken[i]!.some((option) => prepared.titleSet.has(option)) && matchedTitle[i]);
    const startsWith = optionsPerToken[0]!.some((option) => prepared.titleTokens[0]?.startsWith(option));
    const score = WEIGHT_RELEVANCE * relevance + WEIGHT_EXACT * (exact ? 1 : 0) + WEIGHT_START * (startsWith ? 1 : 0);
    if (!best || score > best.score) best = { item: prepared.item, score, exact };
  }
  return best;
}

export type SearchLimits = { sticks: number; brands: number; articles: number };

/** A short answer above the results, with the knowledge article it comes from. */
export type SearchAnswer = { text: string; path: string; title: string };

export type SearchOutcome = {
  /** The query as it was read: trimmed and cut to the maximum length. */
  query: string;
  sticks: Scored[];
  brands: Scored[];
  articles: Scored[];
  /** Everything found, before the limits per group. */
  total: number;
  /** A knowledge question with a prepared answer (carbon, beginner, length, size, low bow), when no stick matches by name. */
  answer: SearchAnswer | null;
  /** A general word (kind, junior, beginner, advice, size, first): the search points at the stickwijzer. */
  wijzerHint: boolean;
  /**
   * A knowledge question: the articles are listed before the sticks, so at least one stays in view.
   * Never when a stick matches by name (an exact model match is never below an article).
   */
  knowledgeFirst: boolean;
};

const byScore = (a: Scored, b: Scored) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'nl');

export function search(index: PreparedIndex, raw: string, config: SearchConfig, limits: SearchLimits): SearchOutcome {
  const query = raw.trim().slice(0, MAX_QUERY_LENGTH);
  const tokens = searchTokens(query);
  const empty: SearchOutcome = { query, sticks: [], brands: [], articles: [], total: 0, answer: null, wijzerHint: false, knowledgeFirst: false };
  // From two characters (owner brief); a single digit or letter finds too much.
  if (tokens.length === 0 || query.length < 2) return empty;

  const found: Scored[] = [];
  for (const prepared of index.items) {
    const scored = scoreItem(prepared, tokens, config);
    if (scored) found.push(scored);
  }
  found.sort(byScore);
  const ofType = (type: SearchItemType) => found.filter((entry) => entry.item.type === type);
  const sticks = ofType('stick');
  const brands = ofType('brand');
  const articles = ofType('article');

  // Knowledge questions are short ("carbon", "low bow", "maat"); a longer query names a model.
  const named = sticks.some((entry) => entry.exact);
  const words = tokens.length <= 3 ? knownWords(tokens, config) : new Set<string>();
  const rule = named ? undefined : config.answers.find((entry) => entry.terms.some((term) => words.has(term)));
  const target = rule ? index.items.find((prepared) => prepared.item.id === `/kennis/${rule.article}`) : undefined;
  const answer = rule && target ? { text: rule.text, path: target.item.path, title: target.item.title } : null;
  const wijzerHint = !named && config.stickwijzer.terms.some((term) => words.has(term));

  return {
    query,
    sticks: sticks.slice(0, limits.sticks),
    brands: brands.slice(0, limits.brands),
    articles: articles.slice(0, limits.articles),
    total: found.length,
    answer,
    wijzerHint,
    knowledgeFirst: (answer !== null || wijzerHint) && articles.length > 0,
  };
}
