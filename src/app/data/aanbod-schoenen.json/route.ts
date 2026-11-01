import { getImportedShoes } from '@/catalog/shoes';
import type { ShoeListItem } from '@/components/shoes/ImportedShoes';

/**
 * The shoe models from the shop feeds, as a light static list for the
 * button on /hockeyschoenen: they are not in the HTML of the first page load,
 * like the imported sticks (decision log 2026-10-24, 2026-11-01).
 */
export const dynamic = 'force-static';

export function GET() {
  const items: ShoeListItem[] = getImportedShoes()
    .map((shoe) => ({ slug: shoe.slug, brand: shoe.brand, model: shoe.model, category: shoe.category.value, ageGroup: shoe.ageGroup }))
    .sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
  return Response.json(items, {
    // Data for the page, not a page for search results.
    headers: { 'X-Robots-Tag': 'noindex' },
  });
}
