/**
 * Decathlon product feed (Odyssey Partnerships, XML; read-only), decision log 2026-11-26.
 * One feed row per size or length, with price, an EAN and the shop's delivery costs; rows of one
 * product page are joined into one model here. Unlike Daka's feed it has an EAN on every row, so a
 * stick that PassaHockey also sells (same EAN) is linked 'zeker' on EAN; the rest on name or by
 * hand (decathlonConfirmed.ts), never on a guess. The category path in the feed
 * ("Hockey>Hockeysticks>…") says what a product is; it says nothing about field or indoor, which
 * only the name can. Stock is a feed field of unknown meaning (it is filled on few rows): a row
 * with a clear "none" is out of stock, an empty one counts as listed, and the site says that stock
 * and size are to be checked at the shop. Pure functions; downloading and reporting live in
 * scripts/decathlon-feed.ts.
 */
import { isDecathlonProductPage } from '@/lib/retailers';
import { lengthInches } from './hockeyCityFeed';
import type { DecathlonStickMatch } from './offers/index';
import type { FeedStickModel, PlutoStickModel, StickMatch } from './plutosportFeed';

export type DecathlonRow = {
  /** Product page without query, e.g. https://www.decathlon.nl/p/hockeystick-youngstar-10-voor-kinderen-blauw-rood/375081/m9055975 */
  url: string;
  title: string;
  brand: string;
  /** "Hockey>Hockeysticks>Hockeysticks per merk>adidas hockeystick" */
  categoryPath: string;
  size: string;
  ean?: string;
  priceEur: number;
  /** false only when the feed says "none"; true when it says there is some or says nothing. */
  inStock: boolean;
  /** True when the feed said something about stock for this row (false: an empty field, listed only). */
  stockStated: boolean;
  /** The raw stock field, for the report (what the feed really says is not documented). */
  stockText: string;
  deliveryCostsEur?: number;
  description: string;
  imageUrl?: string;
};

const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const decode = (text: string) => text.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name: string) => ENTITIES[name] ?? '');

const field = (block: string, tag: string) =>
  decode((block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1] ?? '').trim());

/** The product page behind a feed link: the UTM query is dropped, and only a real product page counts. */
export function decathlonPageUrl(link: string): string | null {
  try {
    const page = new URL(link);
    page.search = '';
    page.hash = '';
    return isDecathlonProductPage(page) ? page.toString() : null;
  } catch {
    return null;
  }
}

/** Decathlon writes brands in title case; the catalog uses the brand's own spelling. */
const BRAND_SPELLING: Readonly<Record<string, string>> = { adidas: 'adidas', jdh: 'JDH', tk: 'TK', y1: 'Y1', dita: 'Dita', grays: 'Grays', kipsta: 'Kipsta' };

/**
 * What the feed's stock field says: a number is a count, "out of stock" or "0" is none, anything
 * else that has text is stock, and an empty field says nothing.
 */
export function stockState(text: string): { inStock: boolean; stated: boolean } {
  const value = text.trim().toLowerCase();
  if (!value) return { inStock: true, stated: false };
  if (/^\d+$/.test(value)) return { inStock: Number(value) > 0, stated: true };
  if (/out.?of.?stock|niet.*(op )?voorraad|uitverkocht|geen.*voorraad|^false$|^no$|^nee$/.test(value)) return { inStock: false, stated: true };
  return { inStock: true, stated: true };
}

export function parseDecathlonFeed(xml: string): DecathlonRow[] {
  const rows: DecathlonRow[] = [];
  for (const match of xml.matchAll(/<product(?:\s[^>]*)?>([\s\S]*?)<\/product>/g)) {
    const block = match[1] as string;
    const url = decathlonPageUrl(field(block, 'productURL'));
    const priceEur = Number(field(block, 'price'));
    if (!url || !(priceEur > 0)) continue;
    const brand = field(block, 'brand');
    const ean = field(block, 'EAN');
    const image = field(block, 'imageURL');
    const delivery = Number(field(block, 'deliveryCosts'));
    const stockText = field(block, 'stock');
    const stock = stockState(stockText);
    rows.push({
      url,
      title: field(block, 'name').replace(/\s+/g, ' '),
      brand: BRAND_SPELLING[brand.toLowerCase()] ?? brand,
      categoryPath: field(block, 'categoryPath'),
      size: field(block, 'size'),
      ...(/^\d{8,14}$/.test(ean) && { ean }),
      priceEur,
      inStock: stock.inStock,
      stockStated: stock.stated,
      stockText,
      ...(delivery > 0 && { deliveryCostsEur: delivery }),
      description: field(block, 'description'),
      ...(/^https:\/\//.test(image) && { imageUrl: image }),
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Recognising sticks (calibrated on the feed of 2026-11-26)

/** A hockey stick page: the category path says so. Bags, covers, balls and skates are other paths. */
export const STICK_CATEGORY = /^Hockey>Hockeysticks(>|$)/i;
const KEEPER = /\bkeeper|\bgoalie\b|\bgk\b/i;

/** The rows of one page as one product, in page order. */
export function groupByPage(rows: readonly DecathlonRow[]): DecathlonRow[][] {
  const pages = new Map<string, DecathlonRow[]>();
  for (const row of rows) pages.set(row.url, [...(pages.get(row.url) ?? []), row]);
  return [...pages.values()];
}

/** A player stick: in the stick category, at least one length in inches, no keeper stick. */
export function isDecathlonStick(rows: readonly DecathlonRow[]): boolean {
  const first = rows[0];
  if (!first || !STICK_CATEGORY.test(first.categoryPath) || KEEPER.test(first.title)) return false;
  return rows.some((row) => lengthInches(row.size) !== null);
}

/**
 * "Hockeystick voor volwassenen experts low bow 85% carbon c85 goud/zwart" → "low bow 85% carbon c85 goud/zwart":
 * the generic first word and the audience and level words that Decathlon puts before the model go.
 */
export const stickModelName = (title: string) =>
  title
    .replace(/^(zaal|indoor)?hockeystick\s+/i, '')
    .replace(/^voor\s+(volwassenen|kinderen|jongeren|dames|heren)\s+(experts?|gevorderden|beginners?|gemiddelde spelers?)?\s*/i, '')
    .trim();

export type DecathlonStickModel = FeedStickModel & {
  imageUrl?: string;
  /** Lengths in inches that are not out of stock, from the rows. */
  lengths: number[];
  /** The feed said something about stock on at least one row; false means "listed only". */
  stockStated: boolean;
  /** The shop's delivery costs on the rows, when they are all the same. */
  deliveryCostsEur?: number;
};

export function decathlonSticks(rows: readonly DecathlonRow[]): DecathlonStickModel[] {
  return groupByPage(rows)
    .filter(isDecathlonStick)
    .map((page) => {
      const first = page[0] as DecathlonRow;
      const sized = page.filter((row) => lengthInches(row.size) !== null);
      const inStock = sized.filter((row) => row.inStock);
      const prices = page.map((row) => row.priceEur);
      const image = page.find((row) => row.imageUrl)?.imageUrl;
      const delivery = new Set(page.map((row) => row.deliveryCostsEur).filter((value) => value !== undefined));
      const model = stickModelName(first.title);
      // The title seldom holds the brand; when it does, it is not written twice.
      const name = model.toLowerCase().startsWith(first.brand.toLowerCase()) ? `${first.brand}${model.slice(first.brand.length)}` : `${first.brand} ${model}`;
      const lengths = [...new Set(inStock.map((row) => lengthInches(row.size) as number))].sort((a, b) => a - b);
      return {
        key: first.url,
        name,
        brand: first.brand,
        modelText: '',
        specText: '',
        url: first.url,
        discipline: /\bindoor\b|zaal/i.test(first.title) ? 'zaal' : 'veld',
        junior: /\b(kinderen|kind|kids|jr|junior|jongens|meisjes)\b/i.test(first.title) || (lengths.length > 0 && lengths.every((length) => length <= 32)),
        eans: [...new Set(page.flatMap((row) => (row.ean ? [row.ean] : [])))],
        inStock: inStock.length > 0,
        inStockPriceMin: inStock.length ? Math.min(...inStock.map((row) => row.priceEur)) : null,
        priceMin: Math.min(...prices),
        lengths,
        stockStated: page.some((row) => row.stockStated),
        ...(delivery.size === 1 && { deliveryCostsEur: [...delivery][0] as number }),
        ...(image && { imageUrl: image }),
      };
    });
}

/** A Decathlon stick in the shape of the shared feed import (src/catalog/plutosportImport.ts). */
export function decathlonImportModel(model: DecathlonStickModel): PlutoStickModel {
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
 * The sticks that get a Decathlon button: confirmed by hand first, then the 'zeker' matches (same
 * EAN, or the same brand, model, bow and year); only pages with a length in stock. A confirmed slug
 * whose page is gone or sold out gets nothing, also not a match. 'twijfel' never gets a button.
 */
export function decathlonStickMatches(
  matches: readonly { slug: string; match: StickMatch<DecathlonStickModel> }[],
  sticks: readonly DecathlonStickModel[],
  confirmed: Readonly<Record<string, string>>,
  /** Rejected by the owner: no button, whatever the match (decathlonConfirmed.ts). */
  rejected: ReadonlySet<string> = new Set(),
): Record<string, DecathlonStickMatch> {
  const byUrl = new Map(sticks.map((stick) => [stick.url, stick]));
  const result: Record<string, DecathlonStickMatch> = {};
  const entry = (model: DecathlonStickModel, method: DecathlonStickMatch['method']): DecathlonStickMatch | null =>
    model.inStock && model.inStockPriceMin !== null
      ? { productUrl: model.url, method, priceEur: model.inStockPriceMin, ...(model.lengths.length && { lengths: model.lengths }) }
      : null;
  for (const { slug, match } of [...matches].sort((a, b) => a.slug.localeCompare(b.slug))) {
    if (rejected.has(slug)) continue;
    const handPicked = confirmed[slug];
    if (handPicked) {
      const model = byUrl.get(handPicked);
      const found = model && entry(model, 'handmatig');
      if (found) result[slug] = found;
      continue;
    }
    if (match.level === 'zeker' && match.model) {
      const found = entry(match.model, match.method === 'ean' ? 'ean' : 'naam');
      if (found) result[slug] = found;
    }
  }
  return result;
}
