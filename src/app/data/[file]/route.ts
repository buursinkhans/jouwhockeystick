import { getFieldProducts, getIndoorProducts, isFeedImport } from '@/catalog';

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

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
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
