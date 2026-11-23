import { getAllProducts, isFeedImport } from './index';
import { getShoes, isShoeFeedImport } from './shoes';
import type { Shoe } from './shoes/types';
import type { Product } from './types';
import { MAX_QUERY_LENGTH, searchTokens } from '@/search/tokens';

export { MAX_QUERY_LENGTH, searchTokens };

/**
 * Search on brand and model for /zoeken (homepage proposal, 2026-11-04): a
 * plain GET form read on the server, so it works without JavaScript. It
 * matches names only, never ranks on price, shop or fee, and puts the
 * hand-checked models before the feed imports.
 */

/** Every word of the query starts a word of the name; a number must be the whole number ("5" is not "500"). */
function matches(query: readonly string[], name: string): boolean {
  const words = searchTokens(name);
  return query.every((q) => words.some((word) => (/^\d+$/.test(q) ? word === q : word.startsWith(q))));
}

export type SearchResult = {
  query: string;
  sticks: Product[];
  shoes: Shoe[];
};

export function searchCatalog(raw: string, now: Date = new Date()): SearchResult {
  const query = raw.trim().slice(0, MAX_QUERY_LENGTH);
  const tokens = searchTokens(query);
  if (tokens.length === 0) return { query, sticks: [], shoes: [] };
  const checkedFirst = <T,>(isImport: (item: T) => boolean) => (a: T, b: T) => Number(isImport(a)) - Number(isImport(b));
  const sticks = getAllProducts(now, { includeImported: true })
    .filter((product) => matches(tokens, `${product.brand} ${product.name}`))
    .sort((a, b) => checkedFirst(isFeedImport)(a, b) || a.name.localeCompare(b.name, 'nl'));
  const shoes = getShoes({ includeImported: true })
    .filter((shoe) => matches(tokens, `${shoe.brand} ${shoe.model} ${shoe.variant ?? ''}`))
    .sort((a, b) => checkedFirst(isShoeFeedImport)(a, b) || `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, 'nl'));
  return { query, sticks, shoes };
}
