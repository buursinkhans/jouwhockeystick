import Link from 'next/link';
import { searchCatalog } from '@/catalog/search';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ShoeCard } from '@/components/shoes/ShoeCard';
import { SearchForm } from '@/components/search/SearchForm';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { pageMetadata } from '@/lib/site';

// Search results are not a page to index: each query would be thin, duplicate content.
export const metadata = pageMetadata({
  title: 'Zoeken',
  description: 'Zoek een hockeystick of hockeyschoen op merk of model, met de winkels die hem verkopen.',
  path: '/zoeken',
  noIndex: true,
});

/** Results per kind on one page; a narrower query finds the rest. */
const LIMIT = 48;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? (params.q[0] ?? '') : (params.q ?? '');
  const { query, sticks, shoes } = searchCatalog(raw);
  const total = sticks.length + shoes.length;

  return (
    <>
      <PageHeader
        eyebrow="Zoeken"
        title={query ? `Zoekresultaten voor "${query}"` : 'Zoek een stick of schoen'}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Zoeken', href: '/zoeken' },
        ]}
      >
        <div className="max-w-xl">
          <SearchForm defaultValue={query} />
        </div>
        {query && (
          <p className="mt-3 text-sm text-lijngrijs" aria-live="polite">
            {total === 0
              ? 'Niets gevonden.'
              : `${sticks.length} ${sticks.length === 1 ? 'stick' : 'sticks'} en ${shoes.length} ${shoes.length === 1 ? 'schoen' : 'schoenen'} gevonden, de met de hand nagekeken modellen eerst.`}
          </p>
        )}
      </PageHeader>
      <PageBody>
        {query && total === 0 && (
          <div className="max-w-prose space-y-3 text-inkt/80">
            <p>
              We vonden geen stick of schoen met &quot;{query}&quot; in de naam. Probeer alleen het merk of een deel van
              de modelnaam.
            </p>
            <p>
              Weet je nog niet welk model? De{' '}
              <Link href="/stickwijzer" className="font-semibold text-veld hover:underline">
                stickwijzer
              </Link>{' '}
              helpt je kiezen in een paar vragen.
            </p>
          </div>
        )}
        {sticks.length > 0 && (
          <section aria-labelledby="zoek-sticks">
            <h2 id="zoek-sticks" className="mb-4 text-2xl text-inkt">
              Hockeysticks
            </h2>
            <ProductGrid products={sticks.slice(0, LIMIT)} />
            {sticks.length > LIMIT && (
              <p className="mt-4 text-sm text-lijngrijs">
                De eerste {LIMIT} van {sticks.length}. Maak je zoekopdracht specifieker voor de rest.
              </p>
            )}
          </section>
        )}
        {shoes.length > 0 && (
          <section aria-labelledby="zoek-schoenen" className={sticks.length > 0 ? 'mt-14' : undefined}>
            <h2 id="zoek-schoenen" className="mb-4 text-2xl text-inkt">
              Hockeyschoenen
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shoes.slice(0, LIMIT).map((shoe) => (
                <li key={shoe.slug} className="h-full">
                  <ShoeCard shoe={shoe} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageBody>
    </>
  );
}
