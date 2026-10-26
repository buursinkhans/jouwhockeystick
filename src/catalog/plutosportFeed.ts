/**
 * Plutosport product feed (Awin, CSV; read-only). Keeps the hockey sticks of
 * Plutosport's whole assortment, merges length variants into one model and
 * matches them with our curated catalog (docs/spec/prijsvergelijking.md §3.1):
 * first by EAN, then by brand + normalised model name + bow + collection year.
 * Pure functions; downloading and reporting live in scripts/plutosport-feed.ts.
 * Every match is a proposal: only 'zeker' may go to the site, and only after
 * the owner has seen it.
 */
import { z } from 'zod';
import type { CsvRow } from '@/lib/csv';
import { extractBow, graysFamily } from './feedImport';
import { COLOURS } from './gaps';
import { isJunior, modelTokens, normalBrand } from './passaFeed';
import type { BowProfile, Discipline } from './types';

const optionalText = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

/** "99.95" or "99,95"; Awin writes a dot, but a comma costs nothing to accept. */
const price = z
  .string()
  .transform((value) => Number(value.trim().replace(',', '.')))
  .pipe(z.number().positive());

/**
 * The columns we chose in the Awin feed. Any of them can be empty or missing;
 * only name, links and price are required to use a row. Old/"from" prices and
 * discount columns are deliberately not in the feed (no discount claims).
 */
export const plutosportRowSchema = z.object({
  aw_product_id: optionalText,
  merchant_product_id: optionalText,
  aw_deep_link: z.string().trim().url(),
  merchant_deep_link: z.string().trim().url(),
  product_name: z.string().trim().min(1),
  search_price: price,
  currency: optionalText,
  description: optionalText,
  merchant_image_url: optionalText,
  aw_image_url: optionalText,
  brand_name: optionalText,
  product_model: optionalText,
  model_number: optionalText,
  product_type: optionalText,
  product_short_description: optionalText,
  specifications: optionalText,
  colour: optionalText,
  merchant_product_category_path: optionalText,
  merchant_product_second_category: optionalText,
  ean: optionalText,
  product_GTIN: optionalText,
  mpn: optionalText,
  in_stock: optionalText,
  stock_status: optionalText,
  stock_quantity: optionalText,
  is_for_sale: optionalText,
  pre_order: optionalText,
  size_stock_status: optionalText,
  size_stock_amount: optionalText,
  delivery_time: optionalText,
  'Fashion:size': optionalText,
  parent_product_id: optionalText,
  last_updated: optionalText,
});
export type PlutosportRow = z.infer<typeof plutosportRowSchema>;

const YES = /^(1|yes|ja|true|y)$/i;
const NO = /^(0|no|nee|false|n)$/i;

/** Other sports that also say "hockey" or "stick". */
const OTHER_SPORT = /\b(ijshockey|ice\s*hockey|floorball|unihockey|straathockey|inline\s*hockey|lacrosse)\b/i;

/** Hockey products that are not a field or indoor player stick. */
const NOT_A_STICK =
  /\b(?:stick|hockey)?(?:tas|tassen|bag|bags|backpack|rugzak|hoes|hoezen|sleeve|grip|grips|tape|bal|ballen|ball|balls|keeper\w*|goalie\w*|bescherm\w*|handschoen\w*|schoen\w*|sokken|kousen|bidon|bitje|mondbeschermer|shin\w*|guard\w*|glove\w*|shoe\w*|socks?|bottle|mouthguard\w*|cover\w*|holder)\b|\bmini\s*stick|\bministick/i;

const STICK = /hockeystick|\bsticks?\b/i;

/** The category columns and product type as one text, for the filter. */
function categoryText(row: CsvRow): string {
  return [row.merchant_product_category_path, row.merchant_product_second_category, row.product_type]
    .filter(Boolean)
    .join(' | ');
}

/**
 * A field or indoor hockey stick. Decided on the raw row (before validation),
 * because the feed holds Plutosport's whole assortment: the category says
 * hockey and stick, the name and category do not say bag, grip, ball, keeper
 * or another sport.
 */
export function isHockeyStickRow(row: CsvRow): boolean {
  const categories = categoryText(row);
  const name = row.product_name ?? '';
  const all = `${categories} | ${name}`;
  if (!/hockey/i.test(categories) && !/hockey/i.test(name)) return false;
  if (OTHER_SPORT.test(all)) return false;
  if (NOT_A_STICK.test(all)) return false;
  return STICK.test(categories) || /hockeystick/i.test(name);
}

/** Awin's is_for_sale; an empty column counts as for sale. */
export const isForSale = (row: CsvRow) => !NO.test(row.is_for_sale?.trim() ?? '');

function rowInStock(row: PlutosportRow): boolean {
  if (row.pre_order && YES.test(row.pre_order)) return false;
  const quantity = Number(row.stock_quantity ?? '');
  if (row.in_stock && NO.test(row.in_stock)) return false;
  if (Number.isFinite(quantity) && row.stock_quantity !== undefined && quantity <= 0) return false;
  if (row.in_stock && YES.test(row.in_stock)) return true;
  if (quantity > 0) return true;
  return /in\s*stock|op\s*voorraad|available|leverbaar/i.test(row.stock_status ?? '');
}

/** "36.5", "36,5 inch", '36.5"' → "36,5"; other sizes (S, M, 90 cm) are kept as written. */
/**
 * Plutosport fills neither Fashion:size nor dimensions; the length ends its
 * article number instead: "10221001_36 1/2" is 36,5 inch, "10221065-JR_31"
 * is 31 inch (feed check 2026-10-27). Only plausible stick lengths (18–39).
 */
export function sizeFromArticleNumber(articleNumber: string | undefined): string | null {
  const match = articleNumber?.trim().match(/_(\d{2})(?:\s*1\/2|[.,]5)?$/);
  if (!match?.[1]) return null;
  const inches = Number(match[1]);
  if (inches < 18 || inches > 39) return null;
  return /1\/2|[.,]5$/.test(articleNumber ?? '') ? `${inches},5` : `${inches}`;
}

export function normalSize(size: string | undefined): string | null {
  if (!size) return null;
  const inch = size.match(/^(\d{2})(?:[.,](\d))?\s*(?:inch|in|"|”)?$/i);
  if (inch) return inch[2] && inch[2] !== '0' ? `${inch[1]},${inch[2]}` : `${inch[1]}`;
  return size.trim();
}

const sizeValue = (size: string) => Number(size.replace(',', '.'));
const bySize = (a: string, b: string) => sizeValue(a) - sizeValue(b) || a.localeCompare(b);

export type PlutoStickModel = {
  /**
   * The product page: one model with its lengths. Not parent_product_id:
   * Plutosport gives each length its own parent ID (first run, 2026-10-26).
   */
  key: string;
  name: string;
  brand: string;
  /** product_model and model_number, as extra text for the matcher. */
  modelText: string;
  /** specifications and short description: where a shop states the bow when the name does not. */
  specText: string;
  /** Product page at plutosport.nl, without query. */
  url: string;
  /** Awin product link from the feed (for PR 2; never shown in reports). */
  awDeepLink: string;
  discipline: Discipline;
  junior: boolean;
  eans: string[];
  sizes: string[];
  sizesInStock: string[];
  priceMin: number;
  priceMax: number;
  /** Lowest price of a length that is in stock; null when nothing is in stock. */
  inStockPriceMin: number | null;
  inStock: boolean;
  categories: string[];
  lastUpdated?: string;
  /** Product photo from the shop (merchant_image_url, else Awin's copy). */
  imageUrl?: string;
  /** The shop's description, for specs it states there (carbon percentage). */
  description: string;
};

const pageUrl = (url: string) => url.replace(/[?#].*$/, '').replace(/\/$/, '');

const eansOf = (row: PlutosportRow) =>
  [row.ean, row.product_GTIN]
    .flatMap((value) => (value ?? '').split(/[,;|\s]+/))
    .map((value) => value.replace(/^0+(?=\d{13}$)/, ''))
    .filter((value) => /^\d{8,14}$/.test(value));

export type FeedTally = {
  rows: number;
  stickRows: number;
  notForSale: number;
  invalid: number;
  notEuro: number;
  /** Product page on another Plutosport site (.com, .de, .be): not the Dutch shop we link to. */
  notDutchShop: number;
};

/** The shop we link to; Plutosport runs the same assortment on other domains per country and language. */
export const isDutchShopUrl = (url: string) => {
  try {
    return /^(www\.)?plutosport\.nl$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url.trim()).hostname.toLowerCase() : '(geen link)';
  } catch {
    return '(ongeldige link)';
  }
};

/** Columns that may hold the stick length; which one Plutosport fills is checked per run. */
export const SIZE_COLUMNS = [
  'Fashion:size',
  'dimensions',
  'size_stock_status',
  'size_stock_amount',
  // Article numbers: Plutosport has one row per length but no size column, so the length may be coded here.
  'merchant_product_id',
  'mpn',
  'model_number',
] as const;

/** Collects stick rows into models; feed rows go in one by one, so the feed never sits in memory as a whole. */
export class PlutosportCollector {
  readonly tally: FeedTally = { rows: 0, stickRows: 0, notForSale: 0, invalid: 0, notEuro: 0, notDutchShop: 0 };
  /** How many stick rows each category combination had: shows the owner what the filter kept. */
  readonly categoryCounts = new Map<string, number>();
  /** What the whole feed holds, sticks or not: shows whether the Awin filter lets through what we expect. */
  readonly feedProfile = {
    columns: [] as string[],
    categories: new Map<string, number>(),
    brands: new Map<string, number>(),
    /** Domain of the product pages: the language setting in Awin can bring in other Plutosport sites. */
    hosts: new Map<string, number>(),
    parents: new Set<string>(),
    pages: new Set<string>(),
    rowsWithSize: 0,
    rowsWithDimensions: 0,
    rowsInStock: 0,
  };
  /** Most common values of the size-like columns in stick rows: shows where the feed puts the length. */
  readonly sizeColumnValues = new Map<string, Map<string, number>>();
  private readonly models = new Map<string, PlutoStickModel>();

  private profile(raw: CsvRow): void {
    const p = this.feedProfile;
    if (p.columns.length === 0) p.columns = Object.keys(raw);
    const count = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);
    count(p.categories, categoryText(raw) || '(geen categorie)');
    count(p.brands, raw.brand_name?.trim() || '(geen merk)');
    count(p.hosts, hostOf(raw.merchant_deep_link));
    if (raw.parent_product_id?.trim()) p.parents.add(raw.parent_product_id.trim());
    if (raw.merchant_deep_link) p.pages.add(pageUrl(raw.merchant_deep_link.trim()).toLowerCase());
    if (raw['Fashion:size']?.trim()) p.rowsWithSize++;
    if (raw.dimensions?.trim()) p.rowsWithDimensions++;
    if (YES.test(raw.in_stock?.trim() ?? '') || Number(raw.stock_quantity ?? '') > 0) p.rowsInStock++;
  }

  add(raw: CsvRow): void {
    this.tally.rows++;
    this.profile(raw);
    if (!isHockeyStickRow(raw)) return;
    this.tally.stickRows++;
    for (const column of SIZE_COLUMNS) {
      const value = raw[column]?.trim();
      if (!value) continue;
      const values = this.sizeColumnValues.get(column) ?? new Map<string, number>();
      values.set(value, (values.get(value) ?? 0) + 1);
      this.sizeColumnValues.set(column, values);
    }
    if (!isForSale(raw)) {
      this.tally.notForSale++;
      return;
    }
    const parsed = plutosportRowSchema.safeParse(raw);
    if (!parsed.success) {
      this.tally.invalid++;
      return;
    }
    const row = parsed.data;
    if (row.currency && row.currency.toUpperCase() !== 'EUR') {
      this.tally.notEuro++;
      return;
    }
    if (!isDutchShopUrl(row.merchant_deep_link)) {
      this.tally.notDutchShop++;
      return;
    }
    const categories = categoryText(raw) || '(geen categorie)';
    this.categoryCounts.set(categories, (this.categoryCounts.get(categories) ?? 0) + 1);

    const url = pageUrl(row.merchant_deep_link);
    const key = `page:${url.toLowerCase()}`;
    const inStock = rowInStock(row);
    const size = normalSize(row['Fashion:size']) ?? sizeFromArticleNumber(row.merchant_product_id);
    let model = this.models.get(key);
    if (!model) {
      const text = `${row.product_name} | ${categories}`;
      model = {
        key,
        name: row.product_name,
        brand: row.brand_name ?? '',
        modelText: [row.product_model, row.model_number].filter(Boolean).join(' '),
        specText: [row.specifications, row.product_short_description].filter(Boolean).join(' | '),
        description: row.description ?? '',
        ...((row.merchant_image_url ?? row.aw_image_url) && { imageUrl: row.merchant_image_url ?? row.aw_image_url }),
        url,
        awDeepLink: row.aw_deep_link,
        discipline: /zaal|indoor/i.test(text) ? 'zaal' : 'veld',
        junior: isJunior(row.product_name) || /junior|kinder|kids/i.test(categories),
        eans: [],
        sizes: [],
        sizesInStock: [],
        priceMin: row.search_price,
        priceMax: row.search_price,
        inStockPriceMin: null,
        inStock: false,
        categories: [],
        ...(row.last_updated && { lastUpdated: row.last_updated }),
      };
      this.models.set(key, model);
    }
    if (!model.categories.includes(categories)) model.categories.push(categories);
    for (const ean of eansOf(row)) if (!model.eans.includes(ean)) model.eans.push(ean);
    if (size && !model.sizes.includes(size)) model.sizes.push(size);
    model.priceMin = Math.min(model.priceMin, row.search_price);
    model.priceMax = Math.max(model.priceMax, row.search_price);
    if (inStock) {
      model.inStock = true;
      model.inStockPriceMin = Math.min(model.inStockPriceMin ?? Infinity, row.search_price);
      if (size && !model.sizesInStock.includes(size)) model.sizesInStock.push(size);
    }
    if (row.last_updated && (!model.lastUpdated || row.last_updated > model.lastUpdated)) {
      model.lastUpdated = row.last_updated;
    }
  }

  result(): PlutoStickModel[] {
    return [...this.models.values()]
      .map((model) => ({ ...model, sizes: model.sizes.sort(bySize), sizesInStock: model.sizesInStock.sort(bySize) }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.url.localeCompare(b.url));
  }
}

/** Plutosport sticks from complete feed rows; for tests and small files. */
export function collectSticks(rows: readonly CsvRow[]): PlutoStickModel[] {
  const collector = new PlutosportCollector();
  for (const row of rows) collector.add(row);
  return collector.result();
}

// ---------------------------------------------------------------------------
// Matching with our catalog

export type CatalogStick = {
  slug: string;
  brand: string;
  name: string;
  discipline: Discipline;
  bow?: BowProfile;
  modelYear?: number;
  /** EANs we know for this stick: from the PassaHockey feed, via its PassaHockey page. */
  eans: readonly string[];
};

export type MatchLevel = 'zeker' | 'twijfel' | 'geen';

export type StickMatch = {
  slug: string;
  level: MatchLevel;
  method?: 'ean' | 'naam';
  model?: PlutoStickModel;
  /** Why it is not 'zeker' (or how it is): shown in the report. */
  note: string;
};

/**
 * Collection year in a name: "2025/26", "25/26" and "2025-2026" give 2025
 * (the season starts in that year, as our model years do), "2026" gives 2026.
 */
export function seasonYear(text: string): number | null {
  const season = text.match(/\b(?:20)?(2\d)\s*[/-]\s*(?:20)?(2\d)\b/);
  if (season?.[1] && season[2] && Number(season[2]) === Number(season[1]) + 1) return 2000 + Number(season[1]);
  const year = text.match(/\b20(2\d)\b/);
  return year?.[1] ? 2000 + Number(year[1]) : null;
}

/** Bow named in a shop's name; Grays families first (decision log 2026-10-19). */
export function bowInName(name: string, brand: string): BowProfile | null {
  if (normalBrand(brand) === 'grays') {
    const family = graysFamily(name);
    if (family) return family.bow;
  }
  const finding = extractBow('', name);
  if (finding.bow) return finding.bow;
  // Abbreviations ("PB", "LB") through the same normalisation as the model words.
  const tokens = new Set(modelTokens(name, brand));
  const named = (['probow', 'lowbow', 'midbow', 'dynabow', 'ultrabow'] as const).find((bow) => tokens.has(bow));
  return named ?? (tokens.has('jumbow') ? 'lowbow' : null);
}

/**
 * The Indian Maharadja article codes start with 10 + the year, also in
 * Plutosport's page names ("…-blade-10-hockeystick-senior-10231006" is 2023,
 * "…-10221065-jr" is 2022), as in feedImport's modelYearFromUrl.
 */
export function yearFromArticleCode(url: string, brand: string): number | null {
  if (!sameBrand(brand, 'The Indian Maharadja')) return null;
  const year = url.match(/-10(2\d)\d{4}(?:-[a-z]+)?\/?$/i)?.[1];
  return year ? 2000 + Number(year) : null;
}

/** How many different bow types a text mentions. */
const bowCount = (text: string) =>
  new Set((text.match(/\b(?:extreme\s*-?\s*low|low|mid|pro|ultra|dyna|jum)\s*-?\s*bow\b/gi) ?? []).map((m) => m.toLowerCase().replace(/[\s-]/g, ''))).size;

/** Seasons and years leave the model words; seasonYear compares them separately. */
const withoutYears = (text: string) =>
  text.replace(/\b(?:20)?2\d\s*[/-]\s*(?:20)?2\d\b/g, ' ').replace(/\b20[23]\d\b/g, ' ');

/** Words in a shop's name that say nothing about the model. */
const NOISE = new Set([
  ...COLOURS,
  'hockeystick', 'hockeysticks', 'hockey', 'stick', 'sticks', 'sr', 'senior', 'veldhockey', 'zaalhockey', 'outdoor',
  'field', 'unisex', 'heren', 'dames', 'men', 'women', 'volwassenen', 'kinderen', 'kind', 'jongens', 'meisjes',
  'zwart', 'wit', 'multi', 'multicolor', 'multicolour', 'neon', 'fluo', 'mix', 'print', 'design',
]);

const BOW_TOKENS = new Set([
  'lowbow', 'midbow', 'probow', 'dynabow', 'jumbow', 'ultrabow', 'extreme', 'low', 'mid', 'bow', 'lb', 'mb', 'pb', 'db', 'jb',
  'xlb', 'elb',
]);

/** Brand names written differently: "The Indian Maharadja" / "Indian Maharadja", "Csign Sports" / "Csign". */
export function sameBrand(a: string, b: string): boolean {
  const clean = (brand: string) =>
    normalBrand(brand)
      .replace(/^the\s+/, '')
      .replace(/\s+(sports?|hockey)$/, '')
      .trim();
  return clean(a) !== '' && clean(a) === clean(b);
}

type Comparison = { reasons: string[] } | { otherYear: number } | null;

function compare(stick: CatalogStick, model: PlutoStickModel): Comparison {
  if (!sameBrand(stick.brand, model.brand || model.name.split(/\s+/)[0] || '')) return null;
  if (stick.discipline !== model.discipline) return null;
  if (isJunior(stick.name) !== model.junior) return null;
  const ours = modelTokens(withoutYears(stick.name), stick.brand);
  if (ours.length === 0) return null;
  const theirText = `${model.name} ${model.modelText}`;
  const theirs = new Set(modelTokens(withoutYears(theirText), model.brand || stick.brand));
  if (!ours.every((token) => theirs.has(token))) return null;

  // The name first; the specifications only when they name exactly one bow (not a list of options).
  const specBow = extractBow('', model.specText).bow;
  const theirBow = bowInName(theirText, model.brand || stick.brand) ?? (specBow && bowCount(model.specText) === 1 ? specBow : null);
  if (stick.bow && theirBow && stick.bow !== theirBow) return null;

  const theirYear = seasonYear(theirText) ?? yearFromArticleCode(model.url, model.brand || stick.brand);
  if (stick.modelYear && theirYear && stick.modelYear !== theirYear) return { otherYear: theirYear };

  const reasons: string[] = [];
  const oursSet = new Set(ours);
  const extra = [...theirs].filter(
    (token) => !oursSet.has(token) && !NOISE.has(token) && !BOW_TOKENS.has(token) && !/^\d{6,}$/.test(token),
  );
  if (extra.length) reasons.push(`extra in de naam bij Plutosport: ${extra.join(', ')}`);
  if (!stick.modelYear) reasons.push('modeljaar niet bekend in onze catalogus');
  else if (!theirYear) reasons.push('geen modeljaar in de naam bij Plutosport');
  if (stick.bow && !theirBow) reasons.push('bow niet in de naam bij Plutosport');
  return { reasons };
}

/** In stock first, then the lowest price: the variant a buyer would see. */
const preferred = (a: PlutoStickModel, b: PlutoStickModel) =>
  Number(b.inStock) - Number(a.inStock) ||
  (a.inStockPriceMin ?? a.priceMin) - (b.inStockPriceMin ?? b.priceMin) ||
  a.url.localeCompare(b.url);

/** Colour variants of one model have the same name apart from the colour. */
const nameKey = (model: PlutoStickModel) =>
  modelTokens(withoutYears(model.name), model.brand)
    .filter((token) => !NOISE.has(token))
    .join(' ');

export function matchStick(stick: CatalogStick, models: readonly PlutoStickModel[]): StickMatch {
  const ours = new Set(stick.eans);
  const byEan = models.filter((model) => model.eans.some((ean) => ours.has(ean))).sort(preferred);
  const [eanHit] = byEan;
  if (eanHit) {
    // PassaHockey puts junior and senior lengths on one page; Plutosport may split them.
    return isJunior(stick.name) === eanHit.junior
      ? { slug: stick.slug, level: 'zeker', method: 'ean', model: eanHit, note: 'EAN gelijk aan die bij PassaHockey' }
      : {
          slug: stick.slug,
          level: 'twijfel',
          method: 'ean',
          model: eanHit,
          note: `EAN gelijk aan die bij PassaHockey, maar Plutosport noemt hem ${eanHit.junior ? 'junior' : 'senior'} en wij niet`,
        };
  }

  const exact: PlutoStickModel[] = [];
  const doubtful: { model: PlutoStickModel; reasons: string[] }[] = [];
  const otherYears = new Set<number>();
  for (const model of models) {
    const result = compare(stick, model);
    if (result === null) continue;
    if ('otherYear' in result) otherYears.add(result.otherYear);
    else if (result.reasons.length === 0) exact.push(model);
    else doubtful.push({ model, reasons: result.reasons });
  }

  if (exact.length) {
    exact.sort(preferred);
    const [best] = exact as [PlutoStickModel];
    const names = new Set(exact.map(nameKey));
    return names.size === 1
      ? { slug: stick.slug, level: 'zeker', method: 'naam', model: best, note: 'merk, model, bow en modeljaar gelijk' }
      : {
          slug: stick.slug,
          level: 'twijfel',
          method: 'naam',
          model: best,
          note: `${names.size} verschillende modellen passen: ${exact.map((m) => m.name).join(' / ')}`,
        };
  }
  if (doubtful.length) {
    doubtful.sort((a, b) => a.reasons.length - b.reasons.length || preferred(a.model, b.model));
    const [best] = doubtful as [{ model: PlutoStickModel; reasons: string[] }];
    const others = doubtful.length - 1;
    const more = others > 0 ? `; ${others} andere ${others === 1 ? 'kandidaat' : 'kandidaten'}` : '';
    return { slug: stick.slug, level: 'twijfel', method: 'naam', model: best.model, note: `${best.reasons.join('; ')}${more}` };
  }
  const years = [...otherYears].sort();
  return {
    slug: stick.slug,
    level: 'geen',
    note: years.length ? `alleen een andere jaargang gevonden (${years.join(', ')})` : 'niet gevonden',
  };
}

// ---------------------------------------------------------------------------
// Overlap

export type OverlapRow = {
  slug: string;
  name: string;
  bol: 'ja' | 'nee' | 'onbekend';
  /** Lowest in-stock price at PassaHockey; null when not linked or not in stock. */
  passaPrice: number | null;
  match: StickMatch;
  /** Plutosport price of the matched model when in stock (zeker or twijfel). */
  plutoPrice: number | null;
  plutoShipping: number | null;
};

const median = (values: readonly number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[middle] as number) : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
};

export type OverlapSummary = {
  sticks: number;
  /** Sold by 2+ partner shops, counting only 'zeker' Plutosport matches. */
  multiShopSure: number;
  /** Same, if every 'twijfel' turns out right. */
  multiShopIfDoubtsHold: number;
  /** Sticks with an in-stock price at both PassaHockey and Plutosport ('zeker'). */
  priced: number;
  medianDifference: number | null;
  medianDifferenceWithShipping: number | null;
  plutoCheaper: number;
};

/**
 * bol.com counts when we link a bol.com product page (stock not checked here);
 * PassaHockey and Plutosport when the feed has the stick in stock.
 */
export function overlapSummary(rows: readonly OverlapRow[]): OverlapSummary {
  const shops = (row: OverlapRow, withDoubts: boolean) =>
    Number(row.bol === 'ja') +
    Number(row.passaPrice !== null) +
    Number(row.plutoPrice !== null && (row.match.level === 'zeker' || (withDoubts && row.match.level === 'twijfel')));
  const priced = rows.filter((row) => row.match.level === 'zeker' && row.passaPrice !== null && row.plutoPrice !== null);
  const diff = priced.map((row) => Math.abs((row.passaPrice as number) - (row.plutoPrice as number)));
  const diffShipping = priced.map((row) =>
    Math.abs((row.passaPrice as number) - ((row.plutoPrice as number) + (row.plutoShipping ?? 0))),
  );
  return {
    sticks: rows.length,
    multiShopSure: rows.filter((row) => shops(row, false) >= 2).length,
    multiShopIfDoubtsHold: rows.filter((row) => shops(row, true) >= 2).length,
    priced: priced.length,
    medianDifference: median(diff),
    medianDifferenceWithShipping: median(diffShipping),
    plutoCheaper: priced.filter((row) => (row.plutoPrice as number) < (row.passaPrice as number)).length,
  };
}
