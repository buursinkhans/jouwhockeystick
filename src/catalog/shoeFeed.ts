/**
 * Hockey shoes in the partner feeds (read-only feed check, step 2 of the
 * /hockeyschoenen plan, issue #100). Do the PassaHockey (TradeTracker) and
 * Plutosport (Awin) feeds hold hockey shoes, how many, of which kind and at
 * which prices? Only counts and describes; nothing goes into the catalog or
 * onto the site. Pure functions; downloading and reporting live in
 * scripts/shoe-feed-check.ts.
 */
import type { CsvRow } from '@/lib/csv';
import { isJunior, parseRecord, productPageUrl } from './passaFeed';
import { isDutchShopUrl } from './plutosportFeed';

export type ShoeShop = 'PassaHockey' | 'Plutosport';
export type ShoeDiscipline = 'veld' | 'zaal' | 'onbekend';

export type ShoeModel = {
  shop: ShoeShop;
  /** Product page without query: one model with its sizes. */
  url: string;
  name: string;
  brand: string;
  discipline: ShoeDiscipline;
  junior: boolean;
  sizes: string[];
  hasEan: boolean;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  /** Category texts the shop uses for this model, so the owner can check the filter. */
  categories: string[];
};

/** Other sports and products that say "hockey" or "schoen" but are not a hockey shoe. */
const NOT_A_HOCKEY_SHOE =
  /\b(ijshockey|ice\s*hockey|floorball|unihockey|inline\s*hockey|straathockey|schaats\w*|skates?|keeper\w*|goalie\w*|sok|sokken|socks?|veters?|laces?|inlegzool\w*|insoles?|zolen|handschoen\w*|glove\w*|schoenentas|shoebag|schoenzak)\b/i;
const SHOE = /schoen|shoe|\bfootwear\b/i;
const INDOOR = /zaal|indoor/i;

/** Shoe sizes as shops write them: "38", "38,5", "38 2/3", "UK 6", "EU 40". Unknown formats are kept as written. */
export function normalShoeSize(size: string | undefined): string | null {
  const text = size?.trim();
  if (!text) return null;
  const eu = text.match(/^(?:eu\s*)?(\d{2})(?:\s*(1\/3|2\/3|1\/2)|[.,](\d))?$/i);
  if (eu?.[1]) {
    const whole = Number(eu[1]);
    if (whole < 16 || whole > 52) return null;
    if (eu[2]) return `${whole} ${eu[2]}`;
    return eu[3] && eu[3] !== '0' ? `${whole},${eu[3]}` : `${whole}`;
  }
  return text;
}

const sizeValue = (size: string) => {
  const match = size.match(/^(\d{2})(?:,(\d)| (\d)\/(\d))?/);
  if (!match?.[1]) return Number.POSITIVE_INFINITY;
  if (match[2]) return Number(`${match[1]}.${match[2]}`);
  if (match[3] && match[4]) return Number(match[1]) + Number(match[3]) / Number(match[4]);
  return Number(match[1]);
};
const bySize = (a: string, b: string) => sizeValue(a) - sizeValue(b) || a.localeCompare(b);

/** A hockey shoe, decided on category texts and the product name. */
export function isHockeyShoe(categoryTexts: readonly string[], name: string): boolean {
  const categories = categoryTexts.join(' | ');
  const all = `${categories} | ${name}`;
  if (!/hockey/i.test(all)) return false;
  if (NOT_A_HOCKEY_SHOE.test(all)) return false;
  return SHOE.test(categories) || /hockeyschoen|hockey\s*shoe/i.test(name);
}

export function shoeDiscipline(categoryTexts: readonly string[], name: string): ShoeDiscipline {
  if (categoryTexts.some((text) => INDOOR.test(text)) || INDOOR.test(name)) return 'zaal';
  if (categoryTexts.some((text) => /hockey/i.test(text)) || /hockey/i.test(name)) return 'veld';
  return 'onbekend';
}

type Draft = ShoeModel & { categorySet: Set<string>; sizeSet: Set<string> };

function finish(drafts: Iterable<Draft>): ShoeModel[] {
  return [...drafts]
    .map(({ categorySet, sizeSet, ...model }) => ({
      ...model,
      categories: [...categorySet].sort(),
      sizes: [...sizeSet].sort(bySize),
      discipline: shoeDiscipline([...categorySet], model.name),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

function addVariant(
  drafts: Map<string, Draft>,
  base: Omit<ShoeModel, 'discipline' | 'sizes' | 'categories' | 'priceMin' | 'priceMax' | 'inStock' | 'hasEan'>,
  variant: { price: number; size: string | null; inStock: boolean; ean: boolean; categories: readonly string[] },
): void {
  let draft = drafts.get(base.url);
  if (!draft) {
    draft = {
      ...base,
      discipline: 'onbekend',
      sizes: [],
      categories: [],
      hasEan: false,
      priceMin: variant.price,
      priceMax: variant.price,
      inStock: false,
      categorySet: new Set(),
      sizeSet: new Set(),
    };
    drafts.set(base.url, draft);
  }
  for (const text of variant.categories) if (text) draft.categorySet.add(text);
  if (variant.size) draft.sizeSet.add(variant.size);
  draft.priceMin = Math.min(draft.priceMin, variant.price);
  draft.priceMax = Math.max(draft.priceMax, variant.price);
  draft.inStock ||= variant.inStock;
  draft.hasEan ||= variant.ean;
  draft.junior ||= base.junior;
}

/** Hockey shoes in the PassaHockey feed (TradeTracker XML), one model per product page. */
export function parsePassaShoes(xml: string): ShoeModel[] {
  const drafts = new Map<string, Draft>();
  for (const match of xml.matchAll(/<product[\s>][\s\S]*?<\/product>/g)) {
    const record = parseRecord(match[0]);
    if (!record) continue;
    const prop = (key: string) => record.properties.get(key) ?? [];
    const categories = [...prop('categoryPath'), ...prop('subcategories'), ...prop('categories')];
    if (!isHockeyShoe(categories, record.name)) continue;
    const url = productPageUrl(record.url);
    if (!url) continue;
    const gender = prop('gender')[0] ?? '';
    addVariant(
      drafts,
      { shop: 'PassaHockey', url, name: record.name, brand: prop('brand')[0] ?? '', junior: isJunior(`${record.name} ${gender}`) },
      {
        price: record.price,
        size: normalShoeSize(prop('size')[0]),
        inStock: prop('availability')[0] === 'in stock' && Number(prop('stock')[0] ?? '0') > 0,
        ean: Boolean(prop('EAN')[0]),
        categories,
      },
    );
  }
  return finish(drafts.values());
}

const YES = /^(1|yes|ja|true|y)$/i;
const NO = /^(0|no|nee|false|n)$/i;

function plutoInStock(row: CsvRow): boolean {
  if (row.in_stock && NO.test(row.in_stock.trim())) return false;
  const quantity = Number(row.stock_quantity ?? '');
  if (row.stock_quantity?.trim() && Number.isFinite(quantity) && quantity <= 0) return false;
  return (row.in_stock !== undefined && YES.test(row.in_stock.trim())) || quantity > 0;
}

/** Shoe size from the column, else from the end of the article number ("12345_38" or "12345_38 2/3"). */
function plutoSize(row: CsvRow): string | null {
  const column = normalShoeSize(row['Fashion:size']);
  if (column) return column;
  const match = row.merchant_product_id?.trim().match(/_(\d{2}(?:\s*[12]\/[23]|[.,]5)?)$/);
  return normalShoeSize(match?.[1]);
}

/** Collects hockey shoes from Plutosport feed rows (Awin CSV), one model per Dutch product page. */
export class PlutoShoeCollector {
  private drafts = new Map<string, Draft>();
  rows = 0;

  add(row: CsvRow): void {
    this.rows += 1;
    const name = row.product_name?.trim() ?? '';
    const categories = [row.merchant_product_category_path, row.merchant_product_second_category, row.product_type].filter(
      (text): text is string => Boolean(text?.trim()),
    );
    if (!name || !isHockeyShoe(categories, name)) return;
    if (row.is_for_sale && NO.test(row.is_for_sale.trim())) return;
    if (row.currency && row.currency.trim().toUpperCase() !== 'EUR') return;
    const page = (row.merchant_deep_link ?? '').replace(/[?#].*$/, '').replace(/\/$/, '');
    if (!page || !isDutchShopUrl(page)) return;
    const price = Number((row.search_price ?? '').trim().replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) return;
    addVariant(
      this.drafts,
      { shop: 'Plutosport', url: page, name, brand: row.brand_name?.trim() ?? '', junior: isJunior(name) },
      {
        price,
        size: plutoSize(row),
        inStock: plutoInStock(row),
        ean: /\d{8,14}/.test(`${row.ean ?? ''} ${row.product_GTIN ?? ''}`),
        categories,
      },
    );
  }

  result(): ShoeModel[] {
    return finish(this.drafts.values());
  }
}

export type ShoeSummary = {
  models: number;
  inStock: number;
  veld: number;
  zaal: number;
  onbekend: number;
  junior: number;
  withEan: number;
  /** Brands by number of models, most first. */
  brands: { brand: string; models: number }[];
  /** Quartiles of the lowest price per model in stock (null without stock). */
  price: { p25: number; median: number; p75: number; min: number; max: number } | null;
  /** Category texts by number of models, to check the filter by hand. */
  categories: { text: string; models: number }[];
};

function quantile(sorted: readonly number[], q: number): number {
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  const a = sorted[low] ?? 0;
  const b = sorted[high] ?? a;
  return Math.round((a + (b - a) * (position - low)) * 100) / 100;
}

function countBy(values: readonly string[]): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function summarizeShoes(models: readonly ShoeModel[]): ShoeSummary {
  const prices = models.filter((m) => m.inStock).map((m) => m.priceMin).sort((a, b) => a - b);
  return {
    models: models.length,
    inStock: prices.length,
    veld: models.filter((m) => m.discipline === 'veld').length,
    zaal: models.filter((m) => m.discipline === 'zaal').length,
    onbekend: models.filter((m) => m.discipline === 'onbekend').length,
    junior: models.filter((m) => m.junior).length,
    withEan: models.filter((m) => m.hasEan).length,
    brands: countBy(models.map((m) => m.brand || 'onbekend')).map(({ key, count }) => ({ brand: key, models: count })),
    price: prices.length
      ? {
          p25: quantile(prices, 0.25),
          median: quantile(prices, 0.5),
          p75: quantile(prices, 0.75),
          min: prices[0] ?? 0,
          max: prices[prices.length - 1] ?? 0,
        }
      : null,
    categories: countBy(models.flatMap((m) => m.categories)).map(({ key, count }) => ({ text: key, models: count })),
  };
}

const normal = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Models sold by both shops, compared on brand and name (rough: no EAN or model year). */
export function shoeOverlap(a: readonly ShoeModel[], b: readonly ShoeModel[]): number {
  const keys = new Set(a.map((m) => `${normal(m.brand)}|${normal(m.name).replace(normal(m.brand), '').trim()}`));
  return b.filter((m) => keys.has(`${normal(m.brand)}|${normal(m.name).replace(normal(m.brand), '').trim()}`)).length;
}
