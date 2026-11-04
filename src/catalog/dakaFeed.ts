/**
 * Daka product feed (Daisycon, XML; read-only), decision log 2026-11-04.
 * One feed row per size or length, with price, stock and Daka's own
 * shipping; rows of one product page are joined into one model here. The
 * feed has a "price_old" on many rows: we never show it (CLAUDE.md, no
 * from-prices). Every row is in the category "Sporten", so sticks and shoes
 * are recognised by brand, name, page and description, and never by a
 * general category. EANs are almost never filled: shoes are linked on EAN
 * only (CLAUDE.md, Hockeyschoenen), so in practice they are not linked.
 * Pure functions; downloading and reporting live in scripts/daka-feed.ts.
 */
import { isDakaProductPage } from '@/lib/retailers';
import type { DakaStickMatch } from './offers/index';
import type { FeedStickModel, PlutoStickModel, StickMatch } from './plutosportFeed';
import { lengthInches } from './hockeyCityFeed';
import { bySize, normalShoeSize, type ShoeModel } from './shoeFeed';

/** Feed "Daka.nl: Fashion" (standard 7) for our media 441384; no key in it. */
export const DAKA_FEED_URL =
  'https://daisycon.io/datafeed/?media_id=441384&standard_id=7&language_code=nl&locale_id=1&type=xml&program_id=7290&html_transform=none&rawdata=false&encoding=utf8&general=false';

export type DakaRow = {
  /** Product page without query, e.g. https://www.daka.nl/p/osaka-mid-bow-40-sku_081402 */
  url: string;
  title: string;
  brand: string;
  size: string;
  ean?: string;
  priceEur: number;
  inStock: boolean;
  description: string;
  imageUrl?: string;
};

const field = (block: string, tag: string) =>
  (block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1] ?? '').trim();

/** The product page behind a feed link (its `dl` path), without Daka's query. */
export function dakaPageUrl(trackingUrl: string): string | null {
  try {
    const dl = new URL(trackingUrl).searchParams.get('dl');
    if (!dl) return null;
    const page = new URL(`https://www.daka.nl/${dl.replace(/^\//, '')}`);
    page.search = '';
    page.hash = '';
    return isDakaProductPage(page) ? page.toString() : null;
  } catch {
    return null;
  }
}

/** Daka writes brands in title case ("Tk", "Jdh"); the catalog uses the brand's own spelling. */
const BRAND_SPELLING: Readonly<Record<string, string>> = {
  tk: 'TK',
  jdh: 'JDH',
  y1: 'Y1',
  adidas: 'adidas',
};

export function parseDakaFeed(xml: string): DakaRow[] {
  const rows: DakaRow[] = [];
  for (const block of xml.split('<product_info>').slice(1)) {
    const url = dakaPageUrl(field(block, 'link'));
    const priceEur = Number(field(block, 'price'));
    if (!url || !(priceEur > 0)) continue;
    const brand = field(block, 'brand');
    const ean = field(block, 'ean');
    const image = block.match(/<location>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/location>/)?.[1]?.trim();
    rows.push({
      url,
      // Some names repeat the brand ("Brabo Brabo It Traditional Carbon 70"), like HockeyCity's.
      title: field(block, 'title').replace(/\s+/g, ' ').replace(/^(\S+)\s+\1\s/i, '$1 '),
      brand: BRAND_SPELLING[brand.toLowerCase()] ?? brand,
      size: field(block, 'size'),
      ...(/^\d{8,14}$/.test(ean) && { ean }),
      priceEur,
      inStock: field(block, 'in_stock') === 'true' && Number(field(block, 'in_stock_amount') || '1') > 0,
      description: field(block, 'description'),
      ...(image && /^https:\/\//.test(image) && { imageUrl: image }),
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Recognising sticks and shoes (calibrated on the feed of 2026-11-04)

/** Brands that make hockey gear; adidas only counts with a hockey word, see below. */
const HOCKEY_BRANDS = /^(grays|brabo|the indian maharadja|osaka|jdh|princess|dita|tk|ritual|y1|malik|stag|reece|ravi|naked|mercian|yibbi|adidas)$/i;
/** Club and team clothing, bags and accessories of those brands. */
const NOT_GEAR =
  /shirt|short|\brok\b|\btee\b|jack|broek|\bsok|hoodie|polo|\btop\b|skort|vest|trui|legging|jurk|\btas\b|bag|backpack|rugzak|glove|handschoen|\bbal\b|ballen|scheen|shinguard|bitje|mouth|grip|tape|\bcap\b|muts|sjaal|bidon|sweater|crew|pant|tight|\bbra\b|cover|hoes|coachboard|masker|bikini|badpak|slipper|adilette/i;
const STICK_WORD = /hockeystick|zaalhockeystick|\bstick\b/i;
const SHOE_WORD = /hockeyschoen|schoen|\bzool\b|veters|klittenband/i;

/** The rows of one page as one product, in page order. */
export function groupByPage(rows: readonly DakaRow[]): DakaRow[][] {
  const pages = new Map<string, DakaRow[]>();
  for (const row of rows) pages.set(row.url, [...(pages.get(row.url) ?? []), row]);
  return [...pages.values()];
}

const pageText = (rows: readonly DakaRow[]) => {
  const first = rows[0]!;
  return `${first.title} ${first.url} ${first.description}`;
};

const isHockeyGear = (rows: readonly DakaRow[]) => {
  const first = rows[0]!;
  return HOCKEY_BRANDS.test(first.brand) && !NOT_GEAR.test(first.title);
};

/** A player stick: the word stick on the page, at least one length in inches, no keeper stick. */
export function isDakaStick(rows: readonly DakaRow[]): boolean {
  if (!rows.length || !isHockeyGear(rows)) return false;
  const text = pageText(rows);
  if (!STICK_WORD.test(text) || /hockeyschoen/i.test(text)) return false;
  if (/\bkeeper|\bgoalie\b|\bgk\b/i.test(rows[0]!.title)) return false;
  return rows.some((row) => lengthInches(row.size) !== null);
}

/** A hockey shoe: a shoe word and "hockey" on the page, no stick in the name or page, and EU sizes. */
export function isDakaShoe(rows: readonly DakaRow[]): boolean {
  if (!rows.length || !isHockeyGear(rows)) return false;
  const first = rows[0]!;
  const text = pageText(rows);
  if (!SHOE_WORD.test(text) || !/hockey/i.test(text)) return false;
  if (STICK_WORD.test(`${first.title} ${first.url}`)) return false;
  return rows.some((row) => euShoeSize(row.size) !== null);
}

/** EU shoe sizes only ("38", "38,5", "38 2/3"), from 16 to 52. */
export function euShoeSize(size: string): string | null {
  const value = normalShoeSize(size);
  return value && /^\d{2}( \d\/\d|,\d)?$/.test(value) ? value : null;
}

// ---------------------------------------------------------------------------
// Sticks

export type DakaStickModel = FeedStickModel & {
  imageUrl?: string;
  /** Lengths in inches in stock, from the rows. */
  lengths: number[];
};

export function dakaSticks(rows: readonly DakaRow[]): DakaStickModel[] {
  return groupByPage(rows)
    .filter(isDakaStick)
    .map((page) => {
      const first = page[0]!;
      const inStock = page.filter((row) => row.inStock && lengthInches(row.size) !== null);
      const prices = page.map((row) => row.priceEur);
      const image = page.find((row) => row.imageUrl)?.imageUrl;
      return {
        key: first.url,
        name: first.title,
        brand: first.brand,
        modelText: '',
        specText: '',
        url: first.url,
        discipline: /\bindoor\b|zaal/i.test(first.title) ? 'zaal' : 'veld',
        junior: /\b(jr|junior|kids)\b/i.test(first.title),
        eans: [...new Set(page.flatMap((row) => (row.ean ? [row.ean] : [])))],
        inStock: inStock.length > 0,
        inStockPriceMin: inStock.length ? Math.min(...inStock.map((row) => row.priceEur)) : null,
        priceMin: Math.min(...prices),
        lengths: [...new Set(inStock.map((row) => lengthInches(row.size) as number))].sort((a, b) => a - b),
        ...(image && { imageUrl: image }),
      };
    });
}

/** A Daka stick in the shape of the shared feed import (src/catalog/plutosportImport.ts). */
export function dakaImportModel(model: DakaStickModel): PlutoStickModel {
  const sizes = model.lengths.map(String);
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
    eans: model.eans,
    sizes,
    sizesInStock: sizes,
    priceMin: model.inStockPriceMin ?? model.priceMin,
    priceMax: model.inStockPriceMin ?? model.priceMin,
    inStockPriceMin: model.inStockPriceMin,
    inStock: model.inStock,
    categories: [],
    ...(model.imageUrl && { imageUrl: model.imageUrl }),
    description: '',
  };
}

/**
 * The sticks that get a Daka button: confirmed by hand first, then the
 * 'zeker' name matches; only pages in stock. A confirmed slug whose page is
 * gone or sold out gets nothing, also not a name match.
 */
export function dakaStickMatches(
  matches: readonly { slug: string; match: StickMatch<DakaStickModel> }[],
  sticks: readonly DakaStickModel[],
  confirmed: Readonly<Record<string, string>>,
): Record<string, DakaStickMatch> {
  const byUrl = new Map(sticks.map((stick) => [stick.url, stick]));
  const result: Record<string, DakaStickMatch> = {};
  const entry = (model: DakaStickModel, method: DakaStickMatch['method']): DakaStickMatch | null =>
    model.inStock && model.inStockPriceMin !== null
      ? { productUrl: model.url, method, priceEur: model.inStockPriceMin, ...(model.lengths.length && { lengths: model.lengths }) }
      : null;
  for (const { slug, match } of [...matches].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const handPicked = confirmed[slug];
    if (handPicked) {
      const model = byUrl.get(handPicked);
      const result_ = model && entry(model, 'handmatig');
      if (result_) result[slug] = result_;
      continue;
    }
    if (match.level === 'zeker' && match.model) {
      const result_ = entry(match.model, 'naam');
      if (result_) result[slug] = result_;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shoes

/** Below EU 36 every size is a children's size. */
const JUNIOR_SIZE_LIMIT = 36;

export function dakaShoes(rows: readonly DakaRow[]): ShoeModel[] {
  return groupByPage(rows)
    .filter(isDakaShoe)
    .map((page) => {
      const first = page[0]!;
      const sized = page.map((row) => ({ ...row, eu: euShoeSize(row.size) })).filter((row) => row.eu !== null);
      const inStock = sized.filter((row) => row.inStock);
      const prices = (inStock.length ? inStock : sized).map((row) => row.priceEur);
      const sizes = [...new Set(sized.map((row) => row.eu as string))].sort(bySize);
      const childSizes = sizes.length > 0 && sizes.every((size) => parseInt(size, 10) < JUNIOR_SIZE_LIMIT);
      const image = page.find((row) => row.imageUrl)?.imageUrl;
      return {
        shop: 'Daka' as const,
        url: first.url,
        name: first.title,
        brand: first.brand,
        // Only the name says field or indoor here; a general shop category is never a source.
        discipline: /\bindoor\b|zaal/i.test(first.title) ? ('zaal' as const) : ('onbekend' as const),
        junior: /\b(jr|junior|kids)\b/i.test(first.title) || childSizes,
        sizes,
        sizesInStock: [...new Set(inStock.map((row) => row.eu as string))].sort(bySize),
        ...(image && { imageUrl: image }),
        eans: [...new Set(sized.flatMap((row) => (row.ean ? [row.ean] : [])))].sort(),
        priceMin: Math.min(...prices),
        priceMax: Math.max(...prices),
        inStock: inStock.length > 0,
        categories: [],
      };
    });
}
