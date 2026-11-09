import { getFieldProducts, getIndoorProducts, isFeedImport } from '@/catalog';
import { indoorItem } from '@/catalog/indoorItems';

/**
 * The sticks imported from the PassaHockey feed, as static JSON per
 * discipline. /sticks and /zaalsticks render only the hand-checked sticks
 * and load this file after a click on "Toon ook … sticks uit het aanbod",
 * so the imported sticks are not in the HTML or React data of the first page
 * load (decision log 2026-10-24).
 */
const FILES = {
  'aanbod-veld.json': () =>
    getFieldProducts(new Date(), { includeImported: true }),
  'aanbod-zaal.json': () =>
    getIndoorProducts(new Date(), { includeImported: true }),
} as const;

type FileName = keyof typeof FILES;

/**
 * The light list of the imported indoor sticks (slug, card price, lengths)
 * for the /zaalsticks finder (2026-11-09). Loaded with aanbod-zaal.json after
 * the first answer, so the first page load still holds only the hand-checked
 * sticks (decision log 2026-10-24).
 */
const INDEX_FILE = 'zaal-index.json';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [...Object.keys(FILES), INDEX_FILE].map((file) => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (file === INDEX_FILE) {
    const now = new Date();
    const items = getIndoorProducts(now, { includeImported: true })
      .filter(isFeedImport)
      .map((product) => indoorItem(product, now));
    return Response.json(items, { headers: { 'X-Robots-Tag': 'noindex' } });
  }
  const products = (FILES[file as FileName]?.().filter(isFeedImport) ?? [])
    // Same order as the list above it: by price on /zaalsticks.
    .sort((a, b) =>
      file === 'aanbod-zaal.json'
        ? a.priceIndicativeEur.value - b.priceIndicativeEur.value
        : 0,
    );
  return Response.json(products, {
    // Data for the page, not a page for search results.
    headers: { 'X-Robots-Tag': 'noindex' },
  });
}
