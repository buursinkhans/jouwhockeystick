import { buildSearchIndex } from '@/search/buildIndex';

/**
 * The index of the live search in the header: hand-checked sticks, brands and
 * articles, a few tens of kilobytes, loaded on the first use of the search
 * (docs/spec/zoeken.md). Static: built once per deploy, so no function.
 */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildSearchIndex(new Date()), {
    // Data for the search box, not a page to find in a search engine.
    headers: { 'X-Robots-Tag': 'noindex' },
  });
}
