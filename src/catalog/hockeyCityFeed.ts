/**
 * HockeyCity product feed (TradeTracker, XML; read-only), decision log
 * 2026-11-03. One feed entry per product page, without lengths or sizes: the
 * price is the page's current price (never the "fromPrice", which we do not
 * show). Lengths, shoe sizes and their stock come from the public product data
 * of each page (`?format=json`), which the weekly sync reads slowly (owner's
 * choice, phase 2). Sticks are matched by name only: their GTIN is HockeyCity's
 * own number (prefix 52619…), not the maker's EAN. Shoes have real EANs per size
 * for most brands and are linked on EAN only (CLAUDE.md, Hockeyschoenen). Pure
 * functions; downloading and reporting live in scripts/hockeycity-feed.ts.
 */
import { z } from 'zod';
import { isHockeyCityProductPage } from '@/lib/retailers';
import { parseRecord } from './passaFeed';
import type { HockeyCityStickMatch } from './offers/index';
import type { FeedStickModel, PlutoStickModel, StickMatch } from './plutosportFeed';
import { bySize, isHockeyShoe, normalShoeSize, type ShoeModel } from './shoeFeed';

/** Feed "HockeyCity.nl - Algemeen" (#1633756) of campaign 27931; same affiliate site as our links. */
export const HOCKEYCITY_FEED_URL =
  'https://pf.tradetracker.net/?aid=517408&encoding=utf-8&type=xml-v2&fid=1633756&categoryType=2&additionalType=2';

export type HockeyCityRecord = {
  /** Product page without query, e.g. https://www.hockeycity.nl/estro-75.html */
  url: string;
  name: string;
  brand: string;
  /** "Hockeysticks > Veldhockeysticks > Adidas" */
  categoryPath: string;
  mpn: string;
  /** The maker's EAN; empty when the feed has none or only HockeyCity's own number. */
  ean?: string;
  priceEur: number;
  inStock: boolean;
  imageUrl?: string;
};

/** HockeyCity numbers its own products from this prefix: not a GS1 EAN, never a link between shops. */
const OWN_NUMBER = /^52619/;

export function makerEan(gtin: string | null | undefined): string | undefined {
  const value = gtin?.trim() ?? '';
  return /^\d{8,14}$/.test(value) && !OWN_NUMBER.test(value) ? value : undefined;
}

/** The product page behind a feed link (the `r` parameter), without the feed's query. */
export function hockeyCityPageUrl(trackingUrl: string): string | null {
  try {
    const target = new URL(trackingUrl).searchParams.get('r');
    if (!target) return null;
    const page = new URL(target);
    page.search = '';
    page.hash = '';
    return isHockeyCityProductPage(page) ? page.toString() : null;
  } catch {
    return null;
  }
}

export function parseHockeyCityFeed(xml: string): HockeyCityRecord[] {
  const records: HockeyCityRecord[] = [];
  for (const match of xml.matchAll(/<product[\s>][\s\S]*?<\/product>/g)) {
    const record = parseRecord(match[0]);
    if (!record || record.price <= 0) continue;
    const url = hockeyCityPageUrl(record.url);
    if (!url) continue;
    const prop = (key: string) => (record.properties.get(key)?.[0] ?? '').replace(/\s+/g, ' ').trim();
    const ean = makerEan(prop('GTIN'));
    records.push({
      url,
      // Some names repeat the brand ("Brabo Brabo G-Force …").
      name: record.name.replace(/^(\S+)\s+\1\s/i, '$1 '),
      brand: prop('brand'),
      categoryPath: prop('categoryPath'),
      mpn: prop('MPN'),
      ...(ean && { ean }),
      priceEur: record.price,
      inStock: prop('availability') === 'in stock',
      ...(record.imageUrl && { imageUrl: record.imageUrl }),
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// The product data of one page (`<page>?format=json`): one variant per length or size

const pageSchema = z.object({
  product: z.object({
    variants: z.record(
      z.string(),
      z.object({
        title: z.string(),
        ean: z.string().nullish(),
        active: z.boolean().optional(),
        price: z.object({ price_incl: z.number().positive() }),
        stock: z.object({ available: z.boolean() }),
      }),
    ),
  }),
});

export type HockeyCityVariant = { title: string; ean?: string; priceEur: number; inStock: boolean };

/** The variants of a page, or null when the data is not what we expect (then nothing is imported). */
export function parseHockeyCityPage(json: unknown): HockeyCityVariant[] | null {
  const parsed = pageSchema.safeParse(json);
  if (!parsed.success) return null;
  // `active` marks the variant the page has selected, not whether it is for sale: stock says that.
  return Object.values(parsed.data.product.variants).map((variant) => {
    const ean = makerEan(variant.ean);
    return {
      title: variant.title.trim(),
      ...(ean && { ean }),
      priceEur: variant.price.price_incl,
      inStock: variant.stock.available,
    };
  });
}

/** Stick lengths in inches in a variant title ("36.5", "36,5", "SR 36.5"); null for anything else. */
export function lengthInches(title: string): number | null {
  const match = title.match(/(?:^|\s)(\d{2}(?:[.,]5)?)(?:\s*(?:inch|"))?$/i);
  const value = match?.[1] ? Number(match[1].replace(',', '.')) : NaN;
  return value >= 18 && value <= 39 ? value : null;
}

/** Lengths in stock and the lowest price of those; nothing in stock gives no lengths. */
export function stickStock(variants: readonly HockeyCityVariant[]): { lengths: number[]; priceEur: number | null } {
  const inStock = variants.filter((variant) => variant.inStock && lengthInches(variant.title) !== null);
  return {
    lengths: [...new Set(inStock.map((variant) => lengthInches(variant.title) as number))].sort((a, b) => a - b),
    priceEur: inStock.length ? Math.min(...inStock.map((variant) => variant.priceEur)) : null,
  };
}

/** EU shoe sizes only ("37", "37,5", "36 2/3"); UK or US sizes are never mixed in. */
const euSize = (title: string) => {
  const size = normalShoeSize(title);
  return size && /^\d{2}( \d\/\d|,\d)?$/.test(size) ? size : null;
};

// ---------------------------------------------------------------------------
// Sticks

const KEEPER = /\(gk\)|\bkeeper|\bgoalie\b/i;

/** Field and indoor player sticks: "Hockeysticks > …", "Zaal > Hockeysticks", "Junior > Hockeysticks". */
export function isHockeyCityStick(record: HockeyCityRecord): boolean {
  const parts = record.categoryPath.split('>').map((part) => part.trim().toLowerCase());
  if (!parts.slice(0, 2).includes('hockeysticks')) return false;
  return !parts.some((part) => /keeper/.test(part)) && !KEEPER.test(record.name);
}

/**
 * The Indian Maharadja article codes start with 10 + the year ("10261046" is
 * 2026), as in plutosportFeed's yearFromArticleCode; other brands' numbers say nothing.
 */
export function yearFromMpn(record: Pick<HockeyCityRecord, 'brand' | 'mpn'>): number | undefined {
  if (!/indian maharadja/i.test(record.brand)) return undefined;
  const year = record.mpn.match(/^10(2\d)\d{4}(?:-|$)/)?.[1];
  return year ? 2000 + Number(year) : undefined;
}

export type HockeyCityStickModel = FeedStickModel & { imageUrl?: string };

export function hockeyCitySticks(records: readonly HockeyCityRecord[]): HockeyCityStickModel[] {
  return records.filter(isHockeyCityStick).map((record) => {
    const year = yearFromMpn(record);
    return {
      key: record.url,
      name: record.name,
      brand: record.brand,
      modelText: '',
      specText: '',
      url: record.url,
      discipline: /zaal/i.test(record.categoryPath) || /\bindoor\b/i.test(record.name) ? 'zaal' : 'veld',
      junior: /\b(jr|junior)\b/i.test(record.name) || /junior/i.test(record.categoryPath),
      eans: record.ean ? [record.ean] : [],
      inStock: record.inStock,
      inStockPriceMin: record.inStock ? record.priceEur : null,
      priceMin: record.priceEur,
      ...(year && { year }),
      ...(record.imageUrl && { imageUrl: record.imageUrl }),
    };
  });
}

/**
 * A HockeyCity stick in the shape of the shared feed import
 * (src/catalog/plutosportImport.ts), with the lengths in stock from its page.
 */
export function asImportModel(model: HockeyCityStickModel, stock: { lengths: readonly number[]; priceEur: number | null }): PlutoStickModel {
  const sizes = stock.lengths.map(String);
  return {
    key: model.key,
    name: model.name,
    brand: model.brand,
    modelText: '',
    specText: '',
    url: model.url,
    awDeepLink: '',
    discipline: model.discipline,
    junior: model.junior,
    eans: [],
    sizes,
    sizesInStock: sizes,
    priceMin: stock.priceEur ?? model.priceMin,
    priceMax: stock.priceEur ?? model.priceMin,
    inStockPriceMin: stock.priceEur,
    inStock: stock.lengths.length > 0,
    categories: [],
    ...(model.imageUrl && { imageUrl: model.imageUrl }),
    description: '',
  };
}

/**
 * The sticks that get a HockeyCity button: confirmed by hand first, then the
 * 'zeker' name matches; only pages the feed lists in stock. A confirmed slug
 * whose page is gone or sold out gets nothing, also not a name match.
 */
export function hockeyCityStickMatches(
  matches: readonly { slug: string; match: StickMatch<HockeyCityStickModel> }[],
  records: readonly HockeyCityRecord[],
  confirmed: Readonly<Record<string, string>>,
): Record<string, HockeyCityStickMatch> {
  const byUrl = new Map(records.map((record) => [record.url, record]));
  const result: Record<string, HockeyCityStickMatch> = {};
  for (const { slug, match } of [...matches].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const handPicked = confirmed[slug];
    if (handPicked) {
      const record = byUrl.get(handPicked);
      if (record?.inStock) result[slug] = { productUrl: record.url, method: 'handmatig', priceEur: record.priceEur };
      continue;
    }
    const model = match.model;
    if (match.level === 'zeker' && model?.inStock && model.inStockPriceMin !== null) {
      result[slug] = { productUrl: model.url, method: 'naam', priceEur: model.inStockPriceMin };
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shoes

/** In HockeyCity's shoe category but not a shoe: a shoe dryer, a set of laces or straps. */
const NOT_A_SHOE = /mister\s*dry|droger|dryer|riemen/i;

export function isHockeyCityShoe(record: HockeyCityRecord): boolean {
  return isHockeyShoe([record.categoryPath], record.name) && !NOT_A_SHOE.test(record.name);
}

/** Below EU 36 every size is a children's size. */
const JUNIOR_SIZE_LIMIT = 36;

/**
 * A HockeyCity shoe page as a feed shoe model (src/catalog/shoeFeed.ts), with
 * the EU sizes, the stock per size and the maker's EAN per size from its page.
 * Without page data only the feed's own EAN and price are known.
 */
export function hockeyCityShoeModel(record: HockeyCityRecord, variants: readonly HockeyCityVariant[] | null): ShoeModel {
  const sized = (variants ?? []).map((variant) => ({ ...variant, size: euSize(variant.title) }));
  const inStock = sized.filter((variant) => variant.inStock);
  const prices = (inStock.length ? inStock : sized).map((variant) => variant.priceEur);
  const eans = [...new Set([...(record.ean ? [record.ean] : []), ...sized.flatMap((variant) => (variant.ean ? [variant.ean] : []))])].sort();
  const sizes = [...new Set(sized.flatMap((variant) => (variant.size ? [variant.size] : [])))].sort(bySize);
  // A kids' line often has no "JR" in the name (adidas Youngstar): its sizes tell.
  const childSizes = sizes.length > 0 && sizes.every((size) => parseInt(size, 10) < JUNIOR_SIZE_LIMIT);
  return {
    shop: 'HockeyCity',
    url: record.url,
    name: record.name,
    brand: record.brand,
    discipline: /zaal/i.test(record.categoryPath) ? 'zaal' : /veld/i.test(record.categoryPath) ? 'veld' : 'onbekend',
    junior: /\b(jr|junior|kids|gs)\b/i.test(record.name) || childSizes,
    sizes,
    sizesInStock: [...new Set(inStock.flatMap((variant) => (variant.size ? [variant.size] : [])))].sort(bySize),
    ...(record.imageUrl && { imageUrl: record.imageUrl }),
    eans,
    priceMin: prices.length ? Math.min(...prices) : record.priceEur,
    priceMax: prices.length ? Math.max(...prices) : record.priceEur,
    inStock: variants ? inStock.length > 0 : record.inStock,
    categories: [record.categoryPath],
  };
}
