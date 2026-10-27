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
  /** EAN/GTIN codes of all sizes: the reliable way to find the same shoe at two shops. */
  eans: string[];
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  /** Category texts the shop uses for this model, so the owner can check the filter. */
  categories: string[];
};

/** Other sports and products that say "hockey" or "schoen" but are not a hockey shoe. */
const NOT_A_HOCKEY_SHOE =
  /\b(ijshockey|ice\s*hockey|floorball|unihockey|inline\s*hockey|straathockey|schaats\w*|skates?|keeper\w*|goalie\w*|sok|sokken|socks?|slipper\w*|sandal\w*|adilette|veters?|laces?|inlegzool\w*|insoles?|zolen|handschoen\w*|glove\w*|schoenentas|shoebag|schoenzak)\b/i;
const SHOE = /schoen|shoe|\bfootwear\b/i;
/** Paths that mention hockey and shoes but hold other things: other sports, shoe care and accessories. */
const OTHER_SPORT_PATH = /ijshockey|ice\s*hockey|floorball|unihockey|inline|accessoire|verzorging/i;
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

/**
 * A category path that is itself about hockey shoes ("Hockey > Hockeyschoenen",
 * "Hockey > Zaalhockey > Zaalhockey schoenen", "Hockey > Schoenen > Veldhockey").
 * Shops put one shoe in many paths: a volleyball shoe in "Hockey > Black Friday"
 * or a slipper in "Hockey > Accessoires" is not a hockey shoe (first run, 2026-10-27).
 */
export const isHockeyShoePath = (path: string) => /hockey/i.test(path) && SHOE.test(path) && !OTHER_SPORT_PATH.test(path);

/** A hockey shoe: at least one hockey-shoe category path, or "hockeyschoen" in the name; never a stick or accessory. */
export function isHockeyShoe(categoryTexts: readonly string[], name: string): boolean {
  if (/hockeystick|\bstick\b/i.test(name)) return false;
  if (NOT_A_HOCKEY_SHOE.test(name)) return false;
  const shoePaths = categoryTexts.filter(isHockeyShoePath);
  if (shoePaths.some((path) => NOT_A_HOCKEY_SHOE.test(path))) return false;
  return shoePaths.length > 0 || /hockeyschoen|hockey\s*shoe/i.test(name);
}

/** Field or indoor, from the hockey-shoe paths only (other paths may say "indoor" for volleyball). */
export function shoeDiscipline(categoryTexts: readonly string[], name: string): ShoeDiscipline {
  const shoePaths = categoryTexts.filter(isHockeyShoePath);
  const hockeyShoe = shoePaths.length > 0 || /hockey/i.test(name);
  if (shoePaths.some((path) => INDOOR.test(path)) || (hockeyShoe && INDOOR.test(name))) return 'zaal';
  if (shoePaths.length > 0 || /hockeyschoen|hockey\s*shoe/i.test(name)) return 'veld';
  return 'onbekend';
}

/** EAN-8/13 and GTIN-14 codes in a text; leading zeros of a GTIN-14 are dropped so it equals the EAN-13. */
export const eansIn = (text: string) =>
  [...new Set((text.match(/\d{8,14}/g) ?? []).map((code) => code.replace(/^0+(?=\d{13}$)/, '')))];

type Draft = ShoeModel & { categorySet: Set<string>; sizeSet: Set<string> };

function finish(drafts: Iterable<Draft>): ShoeModel[] {
  return [...drafts]
    .map(({ categorySet, sizeSet, ...model }) => ({
      ...model,
      categories: [...categorySet].filter(isHockeyShoePath).sort(),
      sizes: [...sizeSet].sort(bySize),
      discipline: shoeDiscipline([...categorySet], model.name),
      eans: [...model.eans].sort(),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

function addVariant(
  drafts: Map<string, Draft>,
  base: Omit<ShoeModel, 'discipline' | 'sizes' | 'categories' | 'priceMin' | 'priceMax' | 'inStock' | 'eans'>,
  variant: { price: number; size: string | null; inStock: boolean; eans: readonly string[]; categories: readonly string[] },
): void {
  let draft = drafts.get(base.url);
  if (!draft) {
    draft = {
      ...base,
      discipline: 'onbekend',
      sizes: [],
      categories: [],
      eans: [],
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
  for (const ean of variant.eans) if (!draft.eans.includes(ean)) draft.eans.push(ean);
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
        eans: eansIn(prop('EAN').join(' ')),
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
        eans: eansIn(`${row.ean ?? ''} ${row.product_GTIN ?? ''}`),
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
    withEan: models.filter((m) => m.eans.length > 0).length,
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

/** Models of shop B that shop A also sells: same EAN for at least one size. */
export function shoeOverlap(a: readonly ShoeModel[], b: readonly ShoeModel[]): number {
  const eans = new Set(a.flatMap((m) => m.eans));
  return b.filter((m) => m.eans.some((ean) => eans.has(ean))).length;
}
