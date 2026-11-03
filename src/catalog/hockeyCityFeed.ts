/**
 * HockeyCity product feed (TradeTracker, XML; read-only), decision log
 * 2026-11-03. One feed entry per product page, without lengths or sizes: the
 * price is the page's current price (never the "fromPrice", which we do not
 * show). Sticks are matched by name only: their GTIN is HockeyCity's own
 * number (prefix 52619…), not the maker's EAN. Shoes have real EANs for most
 * brands and are linked on EAN only (CLAUDE.md, Hockeyschoenen). Pure
 * functions; downloading and reporting live in scripts/hockeycity-feed.ts.
 */
import { isHockeyCityProductPage } from '@/lib/retailers';
import { parseRecord } from './passaFeed';
import type { HockeyCityStickMatch } from './offers/index';
import type { FeedStickModel, StickMatch } from './plutosportFeed';
import type { ShoeListing } from './shoes/types';

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

export function makerEan(gtin: string | undefined): string | undefined {
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
      name: record.name,
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

const NOT_A_SHOE = /glove|handschoen|riemen|slipper|slider|sok/i;

export function isHockeyCityShoe(record: HockeyCityRecord): boolean {
  return /schoen/i.test(record.categoryPath) && !NOT_A_SHOE.test(record.name);
}

/**
 * HockeyCity's listing per shoe model whose EANs include a HockeyCity page's
 * EAN (one size per page in this feed). The linked page is the cheapest in
 * stock, else the cheapest. No sizes: the feed does not list them.
 */
export function hockeyCityShoeListings(
  shoes: readonly { slug: string; eans: readonly string[] }[],
  records: readonly HockeyCityRecord[],
  date: string,
): Record<string, ShoeListing> {
  const slugByEan = new Map<string, string>();
  for (const shoe of shoes) for (const ean of shoe.eans) if (!slugByEan.has(ean)) slugByEan.set(ean, shoe.slug);
  const pages = new Map<string, HockeyCityRecord[]>();
  for (const record of records.filter(isHockeyCityShoe)) {
    const slug = record.ean ? slugByEan.get(record.ean) : undefined;
    if (slug) pages.set(slug, [...(pages.get(slug) ?? []), record]);
  }
  const listings: Record<string, ShoeListing> = {};
  for (const [slug, found] of [...pages.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const [best] = [...found].sort(
      (a, b) => Number(b.inStock) - Number(a.inStock) || a.priceEur - b.priceEur || a.url.localeCompare(b.url),
    ) as [HockeyCityRecord];
    listings[slug] = {
      shop: 'hockeycity',
      url: best.url,
      priceEur: best.priceEur,
      inStock: best.inStock,
      sizes: [],
      sizesInStock: [],
      colourPages: new Set(found.map((record) => record.url)).size,
      ...(best.imageUrl && { imageUrl: best.imageUrl }),
      readAt: date,
    };
  }
  return listings;
}
