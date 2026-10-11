/**
 * Catalog gaps (read-only): popular hockey sticks on bol.com (from the weekly
 * market scan) that are not in our catalog yet. Pure functions; fetching and
 * reporting live in scripts/catalog-gaps.ts. The result is a shortlist for the
 * catalog agent, which still checks each candidate by hand.
 */
import type { MarketSnapshot } from '../market/marketScan';

type CatalogEntry = { brand: string; name: string; bolProductUrl?: string };

export type CatalogGap = {
  /** Model key without sizes and colours, used to merge size variants. */
  key: string;
  title: string;
  ean: string;
  bestRank: number;
  queries: string[];
  price?: number;
  url?: string;
  /** Other listings of the same model (sizes, colours). */
  variants: string[];
};

/** Toy, street and plastic sticks are not club hockey sticks; we leave them out. */
const NOT_CLUB_STICK = /\b(kunststof|straathockey\w*|speelgoed|plastic|ijshockey\w*|floorball|unihockey)\b/i;

const GENERIC = new Set([
  'hockeystick', 'hockeysticks', 'zaalhockeystick', 'zaalhockeysticks', 'hockey', 'stick', 'sticks',
  'veld', 'veldhockeystick', 'outdoor', 'senior', 'sen', 'stk', 'kleur', 'maat', 'de', 'het', 'een', 'en', 'voor',
  'met', 'van', 'the', 'cadeau',
]);

const COLOURS = new Set([
  'zwart', 'wit', 'blauw', 'rood', 'roze', 'groen', 'oranje', 'geel', 'paars', 'zilver', 'grijs', 'goud', 'navy',
  'mintgroen', 'oceaanblauw', 'lichtblauw', 'donkerblauw', 'black', 'white', 'blue', 'red', 'pink', 'green',
  'orange', 'yellow', 'purple', 'silver', 'grey', 'gray', 'gold', 'light', 'dark', 'grijsbrown', 'brown',
]);

const SIZE = /(maat\s*)?\b(1[6-9]|2\d|3\d)(?:[.,]5)?\s*(?:inch|”|"|''|l\b)|maat\s*\d+(?:[.,]\d)?/gi;

/** Lowercase words, without punctuation, sizes and generic shop words. */
export function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(SIZE, ' ')
    .split(/[^a-z0-9%.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t.length > 0 && !GENERIC.has(t));
}

export function bolIdFromUrl(url: string | undefined): string | null {
  return url?.match(/\/(\d{16})\/?(?:[?#].*)?$/)?.[1] ?? null;
}

/** The listing is one of ours: same bol.com product, or every word of our model name appears in its title. */
export function isCovered(item: { title: string; url?: string }, catalog: readonly CatalogEntry[]): boolean {
  const itemId = bolIdFromUrl(item.url);
  const titleTokens = new Set(significantTokens(item.title));
  return catalog.some((product) => {
    if (itemId && itemId === bolIdFromUrl(product.bolProductUrl)) return true;
    const nameTokens = significantTokens(`${product.brand} ${product.name}`);
    return nameTokens.length > 1 && nameTokens.every((t) => titleTokens.has(t));
  });
}

export function modelKey(title: string): string {
  return significantTokens(title)
    .filter((t) => !COLOURS.has(t) && !/^\d{6,}$/.test(t))
    .join(' ');
}

/** Popular sticks missing from the catalog, best-ranked first, size variants merged. */
export function findCatalogGaps(snapshot: MarketSnapshot, catalog: readonly CatalogEntry[], limit = 12): CatalogGap[] {
  const gaps = new Map<string, CatalogGap>();
  for (const list of snapshot.bol) {
    for (const item of list.items) {
      if (NOT_CLUB_STICK.test(item.title) || isCovered(item, catalog)) continue;
      const key = modelKey(item.title);
      if (!key) continue;
      const existing = gaps.get(key);
      if (!existing) {
        gaps.set(key, {
          key,
          title: item.title,
          ean: item.ean,
          bestRank: item.rank,
          queries: [list.query],
          ...(item.price !== undefined && { price: item.price }),
          ...(item.url && { url: item.url }),
          variants: [],
        });
        continue;
      }
      if (!existing.queries.includes(list.query)) existing.queries.push(list.query);
      if (item.rank < existing.bestRank) existing.bestRank = item.rank;
      if (item.title !== existing.title && !existing.variants.includes(item.title)) existing.variants.push(item.title);
    }
  }
  return [...gaps.values()].sort((a, b) => a.bestRank - b.bestRank).slice(0, limit);
}
