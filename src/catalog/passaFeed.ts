/**
 * PassaHockey product feed (TradeTracker, read-only). Parses the feed into
 * stick models (one per product page, sizes and EANs merged), matches them
 * with our catalog and lists sticks PassaHockey sells that we do not have yet.
 * Pure functions; fetching and reporting live in scripts/passa-feed.ts. The
 * matches are suggestions: the catalog agent checks each one before a link
 * goes into the catalog (docs/catalogus-aanvuller.md).
 */
import { significantTokens } from './gaps';

/** Feed "PassaHockey" (#2490853) of campaign Passasports.nl; same affiliate site as our links. */
export const PASSAHOCKEY_FEED_URL =
  'https://pf.tradetracker.net/?aid=517408&encoding=utf-8&type=xml-v2&fid=2490853&categoryType=2&additionalType=2';

const SHOP_ORIGIN = 'https://www.passasports.nl';

export type PassaDiscipline = 'veld' | 'zaal' | 'onbekend';

export type PassaStickModel = {
  /** Product page without query, e.g. https://www.passasports.nl/tk-c1-extreme-low-bow-indoor-224001-84 */
  url: string;
  name: string;
  brand: string;
  discipline: PassaDiscipline;
  /** "Senior", "Junior", … as the feed states it. */
  gender: string;
  description: string;
  imageUrl?: string;
  eans: string[];
  /** Sizes in inches, ascending; sizes the feed states in another way are left out. */
  sizesInches: number[];
  /** Sizes in inches that are in stock, ascending. */
  sizesInStockInches: number[];
  priceMin: number;
  priceMax: number;
  /** True when at least one size is in stock. */
  inStock: boolean;
};

type FeedRecord = {
  name: string;
  price: number;
  url: string;
  imageUrl?: string;
  description: string;
  properties: Map<string, string[]>;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeEntities(text: string): string {
  return text
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name: string) => ENTITIES[name] ?? '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

/** Text of an element. The feed escapes some names twice ("O&amp;apos;Geez"), so entities are decoded twice. */
function decode(text: string): string {
  const cdata = text.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  const raw = cdata ? (cdata[1] ?? '') : decodeEntities(text);
  return decodeEntities(raw).trim();
}

function tag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1] ?? '') : undefined;
}

function parseRecord(block: string): FeedRecord | null {
  const name = tag(block, 'name');
  const url = tag(block, 'URL');
  const price = Number(tag(block, 'price'));
  if (!name || !url || !Number.isFinite(price)) return null;
  const properties = new Map<string, string[]>();
  for (const match of block.matchAll(/<property name="([^"]+)">([\s\S]*?)<\/property>/g)) {
    const [, key = '', body = ''] = match;
    const values = [...body.matchAll(/<value>([\s\S]*?)<\/value>/g)].map((v) => decode(v[1] ?? ''));
    properties.set(key, values);
  }
  const imageUrl = tag(block, 'image');
  return {
    name,
    price,
    url,
    description: tag(block, 'description') ?? '',
    properties,
    ...(imageUrl && { imageUrl }),
  };
}

/** The shop's product page behind a TradeTracker link (the `r` parameter), without size or other query parameters. */
export function productPageUrl(trackingUrl: string): string | null {
  try {
    const target = new URL(trackingUrl).searchParams.get('r');
    if (!target) return null;
    const page = new URL(target, SHOP_ORIGIN);
    if (page.origin !== SHOP_ORIGIN) return null;
    return `${SHOP_ORIGIN}${page.pathname}`;
  } catch {
    return null;
  }
}

function inches(size: string | undefined): number | null {
  const match = size?.match(/^(\d{2}(?:[.,]\d)?)\s*(?:inch|")/i);
  return match?.[1] ? Number(match[1].replace(',', '.')) : null;
}

export function disciplineFromCategories(categoryPaths: readonly string[], name: string): PassaDiscipline {
  if (categoryPaths.some((path) => /zaalhockey/i.test(path)) || /\b(indoor|xi)\b/i.test(name)) return 'zaal';
  if (categoryPaths.some((path) => /hockeysticks/i.test(path))) return 'veld';
  return 'onbekend';
}

/** Keeper sticks and stick accessories also sit under "Sticks"; we only want field and indoor sticks. */
function isPlayerStick(categoryPaths: readonly string[]): boolean {
  const hockey = categoryPaths.filter((path) => /^hockey\b/i.test(path));
  if (hockey.some((path) => /keeper/i.test(path))) return false;
  return hockey.some((path) => !/accessoires/i.test(path));
}

/** Hockey sticks from the feed, one model per product page. */
export function parsePassaFeed(xml: string): PassaStickModel[] {
  const models = new Map<string, PassaStickModel & { categoryPaths: Set<string> }>();
  for (const match of xml.matchAll(/<product[\s>][\s\S]*?<\/product>/g)) {
    const record = parseRecord(match[0]);
    if (!record) continue;
    const prop = (key: string) => record.properties.get(key) ?? [];
    if (!prop('subcategories').includes('Sticks')) continue;
    if (!isPlayerStick(prop('categoryPath'))) continue;
    const url = productPageUrl(record.url);
    if (!url) continue;

    let model = models.get(url);
    if (!model) {
      model = {
        url,
        name: record.name,
        brand: prop('brand')[0] ?? '',
        discipline: 'onbekend',
        gender: prop('gender')[0] ?? '',
        description: record.description,
        ...(record.imageUrl && { imageUrl: record.imageUrl }),
        eans: [],
        sizesInches: [],
        sizesInStockInches: [],
        priceMin: record.price,
        priceMax: record.price,
        inStock: false,
        categoryPaths: new Set(),
      };
      models.set(url, model);
    }
    for (const path of prop('categoryPath')) model.categoryPaths.add(path);
    const ean = prop('EAN')[0];
    if (ean && !model.eans.includes(ean)) model.eans.push(ean);
    const size = inches(prop('size')[0]);
    if (size !== null && !model.sizesInches.includes(size)) model.sizesInches.push(size);
    model.priceMin = Math.min(model.priceMin, record.price);
    model.priceMax = Math.max(model.priceMax, record.price);
    if (prop('availability')[0] === 'in stock' && Number(prop('stock')[0] ?? '0') > 0) {
      model.inStock = true;
      if (size !== null && !model.sizesInStockInches.includes(size)) model.sizesInStockInches.push(size);
    }
  }
  return [...models.values()]
    .map(({ categoryPaths, ...model }) => ({
      ...model,
      discipline: disciplineFromCategories([...categoryPaths], model.name),
      sizesInches: model.sizesInches.sort((a, b) => a - b),
      sizesInStockInches: model.sizesInStockInches.sort((a, b) => a - b),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

type CatalogEntry = {
  slug: string;
  brand: string;
  name: string;
  discipline: 'veld' | 'zaal';
  passaSportsProductUrl?: string;
};

/** Brand names as PassaHockey writes them → ours. */
const BRAND_ALIASES: Record<string, string> = { 'indian maharadja': 'the indian maharadja' };

export const normalBrand = (brand: string) => {
  const lower = brand.trim().toLowerCase();
  return BRAND_ALIASES[lower] ?? lower;
};

/** Words that say what kind of stick it is, not which model. */
const NOT_MODEL = new Set([
  'composite', 'indoor', 'zaal', 'junior', 'jr', 'senior', 'kids', 'kinder', 'hout', 'houten', 'wooden', 'wood', 'wdn',
  'veld', 'veldhockeystick', 'zaalhockeystick', 'carbon',
]);

/** Bow abbreviations brands and shops use for the same thing ("MB 8" at one shop is "Midbow 8" at another). */
const BOW_SYNONYMS: Record<string, string> = {
  lb: 'lowbow', mb: 'midbow', pb: 'probow', db: 'dynabow', jb: 'jumbow', ub: 'ultrabow',
};

/**
 * Model words, comparable across shops: "DB8", "DB 8" and "Dynabow 8" give
 * dynabow + 8; "JB 12+" and "JB+ 12" give jumbow + 12 + plus; "Pro Bow" is
 * probow; seasons ("26/27") and colour codes ("Pi/Wh") are dropped.
 */
export function modelTokens(name: string, brand: string): string[] {
  const brandTokens = new Set(significantTokens(brand));
  const spaced = name
    .replace(/\b\d{2}\/\d{2}\b|\b[a-z]{2}\/[a-z]{2}\b/gi, ' ')
    .replace(/\+/g, ' plus ')
    .replace(/\b(pro|low|mid|jum|dyna|ultra|late|control|grow|show|proto)[\s-]+bow\b/gi, '$1bow')
    .replace(/([a-z])(\d)/gi, '$1 $2')
    .replace(/(\d)([a-z])/gi, (match, digit: string, letter: string) => (letter.toLowerCase() === 'k' ? match : `${digit} ${letter}`));
  return significantTokens(spaced)
    .map((t) => BOW_SYNONYMS[t] ?? (/^0+\d/.test(t) ? t.replace(/^0+/, '') : t))
    .filter((t) => !brandTokens.has(t) && !NOT_MODEL.has(t));
}

export const isJunior = (text: string) => /\b(junior|jr|kinder|kids)\b/i.test(text);

/** Same brand, same junior/senior, no clash in discipline, and every model word of ours in the PassaHockey name. */
export function isSameModel(product: CatalogEntry, model: PassaStickModel): boolean {
  if (normalBrand(product.brand) !== normalBrand(model.brand)) return false;
  if (model.discipline !== 'onbekend' && model.discipline !== product.discipline) return false;
  if (isJunior(product.name) !== (isJunior(model.name) || model.gender === 'Junior')) return false;
  const ours = modelTokens(product.name, product.brand);
  if (ours.length === 0) return false;
  const theirs = new Set(modelTokens(model.name, model.brand));
  return ours.every((t) => theirs.has(t));
}

export type LinkCheck =
  | { kind: 'ok'; slug: string; url: string }
  | { kind: 'uitverkocht'; slug: string; url: string }
  | { kind: 'niet-in-feed'; slug: string; url: string };

export type LinkSuggestion = { slug: string; name: string; candidates: PassaStickModel[] };

export type PassaFeedResult = {
  /** Our sticks with a PassaHockey link: is the page still in the feed and in stock? */
  linked: LinkCheck[];
  /** Our sticks without a link where the feed has the same model (one candidate) or possibly (several). */
  suggestions: LinkSuggestion[];
  /** Sticks in stock at PassaHockey that match nothing in our catalog, one per model name. */
  gaps: PassaGap[];
};

/** A missing stick; PassaHockey often has a page per colour, listed in `otherUrls`. */
export type PassaGap = PassaStickModel & { otherUrls: string[] };

/** Field/indoor and junior/senior, so the gap list covers every kind of player instead of one. */
const segment = (m: PassaStickModel) => `${m.discipline}|${isJunior(m.name) || m.gender === 'Junior' ? 'junior' : 'senior'}`;

const pageKey = (url: string) => url.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();

export function comparePassaFeed(models: readonly PassaStickModel[], catalog: readonly CatalogEntry[]): PassaFeedResult {
  const byUrl = new Map(models.map((m) => [pageKey(m.url), m]));
  const covered = new Set<string>();
  const linked: LinkCheck[] = [];
  const suggestions: LinkSuggestion[] = [];

  for (const product of catalog) {
    const matches = models.filter((m) => isSameModel(product, m));
    for (const m of matches) covered.add(m.url);
    if (product.passaSportsProductUrl) {
      const model = byUrl.get(pageKey(product.passaSportsProductUrl));
      if (model) covered.add(model.url);
      const url = product.passaSportsProductUrl;
      linked.push(
        !model
          ? { kind: 'niet-in-feed', slug: product.slug, url }
          : { kind: model.inStock ? 'ok' : 'uitverkocht', slug: product.slug, url },
      );
      continue;
    }
    const inStock = matches.filter((m) => m.inStock);
    if (inStock.length > 0) suggestions.push({ slug: product.slug, name: product.name, candidates: inStock });
  }

  const ourBrands = new Set(catalog.map((p) => normalBrand(p.brand)));
  // One entry per model name: colours are separate pages in the feed.
  const byName = new Map<string, PassaGap>();
  for (const m of models) {
    if (!m.inStock || covered.has(m.url) || m.gender === 'Baby') continue;
    const key = `${normalBrand(m.brand)}|${m.name.toLowerCase()}`;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...m, otherUrls: [] });
    } else if (m.sizesInches.length > existing.sizesInches.length) {
      byName.set(key, { ...m, otherUrls: [existing.url, ...existing.otherUrls] });
    } else {
      existing.otherUrls.push(m.url);
    }
  }
  // No popularity in the feed: within each kind of stick, brands we already carry first, then
  // the widest size range; then take turns between the kinds.
  const bySegment = new Map<string, PassaGap[]>();
  for (const gap of byName.values()) bySegment.set(segment(gap), [...(bySegment.get(segment(gap)) ?? []), gap]);
  const queues = [...bySegment.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, list]) =>
      list.sort(
        (a, b) =>
          Number(ourBrands.has(normalBrand(b.brand))) - Number(ourBrands.has(normalBrand(a.brand))) ||
          b.sizesInches.length - a.sizesInches.length ||
          a.name.localeCompare(b.name),
      ),
    );
  const gaps: PassaGap[] = [];
  while (queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) gaps.push(next);
    }
  }
  return { linked, suggestions, gaps };
}
