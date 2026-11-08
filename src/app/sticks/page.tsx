import type { Metadata } from 'next';
import { absoluteUrl, pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllBrands, getFieldProducts, isFeedImport } from '@/catalog';
import { getFeedReadDates } from '@/catalog/feedDates';
import { pickVaried } from '@/catalog/picks';
import { BOW_LABELS } from '@/catalog/labels';
import type { BowProfile } from '@/catalog/types';
import { applyCatalogFilters, filterQuery, hasFilters, parseCatalogFilters } from '@/catalog/filters';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';

/** Bows from straight to strongly curved, as the filter lists them. */
const BOW_ORDER = Object.keys(BOW_LABELS) as BowProfile[];
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ImportedSticks } from '@/components/catalog/ImportedSticks';
import { getCatalogStats } from '@/catalog/stats';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { InlineText } from '@/components/article/InlineText';
import { FaqSection } from '@/components/article/FaqSection';
import { productPath } from '@/catalog/paths';
import { itemListJsonLd, jsonLdHtml } from '@/lib/jsonLd';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { VELD, veldFaq, veldMetaDescription } from '@/content/veld';
import { splitListNote } from '@/content/catalogLists';

/** The counts in the description come from the same stats as the page. */
export function generateMetadata(): Metadata {
  const stats = getCatalogStats(new Date());
  return pageMetadata({
    title: VELD.seoTitle,
    description: veldMetaDescription(
      stats.fieldSticks,
      stats.fieldBrands.length,
    ),
    path: '/sticks',
  });
}

/** Filtered results per page; the full unfiltered list keeps its own split. */
const PAGE_SIZE = 48;

export default async function SticksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const now = new Date();
  const brands = getAllBrands(now, 'veld', { includeImported: true });
  const filters = parseCatalogFilters(params, brands);
  const filtered = hasFilters(filters);
  const activeBrand = filters.brand;
  const allProducts = getFieldProducts(now, { includeImported: true });
  // With a filter, every matching stick, curated and imported, a page at a
  // time. Without, only the hand-checked sticks are in the HTML; the imported
  // ones load after a click (ImportedSticks), which keeps the page light
  // (decision log 2026-10-24).
  const matching = filtered ? applyCatalogFilters(allProducts, filters, now) : [];
  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const pageNumber = Math.min(pageCount, Math.max(1, Number(params.pagina) || 1));
  const products = filtered
    ? matching.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE)
    : allProducts.filter((p) => !isFeedImport(p));
  const importedCount = filtered
    ? 0
    : allProducts.filter(isFeedImport).length;
  const total = getCatalogStats(now).fieldSticks;
  const bows = BOW_ORDER.filter((bow) => allProducts.some((p) => p.bowProfile?.value === bow));
  const lengths = [...new Set(allProducts.flatMap((p) => p.lengthsInches.value))].sort((a, b) => a - b);
  // The landing blocks only on the unfiltered page; with a filter the
  // visitor wants the list (the canonical stays /sticks either way).
  const showLanding = !filtered;
  // Hand-checked sticks only for the picks: their specs come with sources.
  const curated = getFieldProducts(now);
  const faq = veldFaq(allProducts);
  // When the shop feeds were read; separate from the editorial updatedAt,
  // which (with the sitemap lastmod) only moves for content changes.
  const feedDates = getFeedReadDates();

  return (
    <>
      <PageHeader
        eyebrow="Catalogus"
        title={VELD.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Veldhockeysticks', href: '/sticks' },
        ]}
      >
        <p className="text-sm text-lijngrijs">
          Door {VELD.author} · gepubliceerd op{' '}
          <time dateTime={VELD.publishedAt}>{VELD.publishedAt}</time> · bijgewerkt
          op <time dateTime={VELD.updatedAt}>{VELD.updatedAt}</time>
        </p>
        {feedDates && (
          <p className="mt-1 text-sm text-lijngrijs">
            Aanbod en winkelprijzen gelezen{' '}
            {feedDates.from === feedDates.to ? (
              <>
                op <time dateTime={feedDates.to}>{feedDates.to}</time>
              </>
            ) : (
              <>
                tussen <time dateTime={feedDates.from}>{feedDates.from}</time> en{' '}
                <time dateTime={feedDates.to}>{feedDates.to}</time>
              </>
            )}
          </p>
        )}
        <TrackedBlock page="sticks" block="intro">
          <p className="mt-5 max-w-3xl text-lg text-inkt/80">
            <InlineText text={VELD.intro} />
          </p>
        </TrackedBlock>

        <div className="mt-8">
          <CatalogFilters action="/sticks" filters={filters} brands={brands} bows={bows} lengths={lengths} />
        </div>
      </PageHeader>

      <PageBody>
        {showLanding && (
          <section aria-labelledby="veld-levels-heading">
            <h2 id="veld-levels-heading" className="text-2xl font-bold">
              {VELD.levels.heading}
            </h2>
            <p className="mt-2 max-w-3xl text-inkt/80">{VELD.levels.intro}</p>
            <TrackedBlock page="sticks" block="levels">
              {VELD.levels.groups.map((group) => {
                const picks = pickVaried(
                  curated.filter((p) => p.experienceLevel.value === group.level),
                );
                return picks.length ? (
                  <div key={group.level} className="mt-6">
                    <h3 className="text-lg font-semibold">{group.heading}</h3>
                    <div className="mt-3">
                      <ProductGrid products={picks} />
                    </div>
                  </div>
                ) : null;
              })}
              <p className="mt-6">
                <a
                  href="#alle-veldsticks"
                  className="font-semibold text-veld hover:underline"
                >
                  {VELD.levels.allLink} ({total}) ↓
                </a>
              </p>
            </TrackedBlock>
          </section>
        )}

        {showLanding && (
          // Visible questions and their FAQPage markup from one source (FaqSection).
          <FaqSection
            id="veld-faq-heading"
            heading={VELD.faq.heading}
            items={faq}
            url={absoluteUrl('/sticks')}
            wrap={(list) => (
              <TrackedBlock page="sticks" block="faq">
                {list}
              </TrackedBlock>
            )}
          />
        )}

        <h2
          id="alle-veldsticks"
          className="mt-12 scroll-mt-24 text-2xl font-bold"
        >
          Alle veldhockeysticks in onze catalogus
        </h2>
        <p className="mt-2 max-w-2xl text-lijngrijs">
          {!filtered && 'Filter op merk. '}Zoek je een stick voor de zaal? Bekijk dan de{' '}
          <Link
            href="/zaalsticks"
            className="font-semibold text-veld hover:underline"
          >
            zaalsticks
          </Link>
          .
        </p>

        {/* With filters active the form above already holds the brand. */}
        {!filtered && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/sticks"
              aria-current={!activeBrand ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
                !activeBrand
                  ? 'border-veld bg-veld text-white'
                  : 'border-lijngrijs text-inkt/80 hover:border-veld'
              }`}
            >
              Alle merken
            </Link>
            {brands.map((b) => (
              <Link
                key={b}
                href={`/sticks?brand=${encodeURIComponent(b)}`}
                aria-current={activeBrand === b ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
                  activeBrand === b
                    ? 'border-veld bg-veld text-white'
                    : 'border-lijngrijs text-inkt/80 hover:border-veld'
                }`}
              >
                {b}
              </Link>
            ))}
          </div>
        )}

        <h3 className="mt-8 text-xl font-bold">
          {filtered
            ? matching.length === 1
              ? '1 stick past bij je filters'
              : `${matching.length} sticks passen bij je filters`
            : 'Alle veldsticks'}{' '}
          {!filtered && <span className="font-normal text-lijngrijs">({total})</span>}
        </h3>
        {importedCount > 0 && (
          <p className="mt-2 max-w-3xl text-sm text-inkt/80">
            {splitListNote(products.length, importedCount)}
          </p>
        )}
        {filtered && matching.length === 0 && (
          <p className="mt-3 max-w-2xl text-inkt/80">
            Geen stick past bij al deze filters tegelijk. Kies een ruimer budget
            of een andere lengte, of{' '}
            <Link href="/stickwijzer" className="font-semibold text-veld hover:underline">
              laat de stickwijzer meedenken
            </Link>
            .
          </p>
        )}
        <div className="mt-4">
          {showLanding && (
            // The hand-checked sticks this page shows, as links (no Product markup on an overview).
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: jsonLdHtml(
                  itemListJsonLd(
                    'Veldhockeysticks met de hand nagekeken',
                    absoluteUrl('/sticks'),
                    products.map((product) => ({ name: product.name, url: absoluteUrl(productPath(product)) })),
                  ),
                ),
              }}
            />
          )}
          <ProductGrid products={products} />
        </div>
        {filtered && pageCount > 1 && (
          <nav aria-label="Pagina's" className="mt-8 flex flex-wrap items-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/sticks${filterQuery(filters, n > 1 ? { pagina: String(n) } : {})}#alle-veldsticks`}
                aria-current={n === pageNumber ? 'page' : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium ${
                  n === pageNumber ? 'border-veld bg-veld text-white' : 'border-rand text-inkt/80 hover:border-veld'
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
        <ImportedSticks
          page="sticks"
          file="aanbod-veld.json"
          count={importedCount}
        />
      </PageBody>
    </>
  );
}
