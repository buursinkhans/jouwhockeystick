import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPriceFresh } from '@/catalog/offers/sort';
import { SHOES_PATH, getShoeBySlug, getShoes, isShoeFeedImport, shoePath } from '@/catalog/shoes';
import { getShoeOffers, shoeImageUrl } from '@/catalog/shoes/offers';
import type { Shoe } from '@/catalog/shoes/types';
import { FitCheck } from '@/components/shoes/FitCheck';
import { ShoeArticleLinks } from '@/components/shoes/ShoeArticleLinks';
import { shoeArticleLinks } from '@/content/shoeArticles';
import { NonMarkingWarning } from '@/components/shoes/NonMarkingWarning';
import { ShoeCard } from '@/components/shoes/ShoeCard';
import { ShoeImage } from '@/components/shoes/ShoeImage';
import { ShoeSpecTable } from '@/components/shoes/ShoeSpecTable';
import { ShoeStatus } from '@/components/shoes/ShoeStatus';
import { ShoeWhereToBuy } from '@/components/shoes/ShoeWhereToBuy';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AGE_LABEL, CATEGORY_LABEL, HOCKEYSCHOENEN, checksFor } from '@/content/hockeyschoenen';
import { jsonLdHtml } from '@/lib/jsonLd';
import { RETAILERS } from '@/lib/retailers';
import { absoluteUrl, pageMetadata } from '@/lib/site';

/** Every model, checked and imported; a slug that leaves the catalog gives a 404. */
export function generateStaticParams() {
  return getShoes({ includeImported: true }).map((shoe) => ({ slug: shoe.slug }));
}
export const dynamicParams = false;

const kindLine = (shoe: Shoe) =>
  shoe.category.value === 'onbekend'
    ? `hockeyschoen (${AGE_LABEL[shoe.ageGroup].toLowerCase()})`
    : `${shoe.category.value}hockeyschoen voor ${shoe.ageGroup === 'junior' ? 'junioren' : 'senioren'}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const shoe = getShoeBySlug((await params).slug);
  if (!shoe) return {};
  return pageMetadata({
    title: `${shoe.brand} ${shoe.model}`,
    description: `${shoe.brand} ${shoe.model}: ${kindLine(shoe)}. Wat de bron bevestigt, wat je nog moet controleren en waar te koop, met bron per gegeven.`,
    path: shoePath(shoe),
    // Feed models carry only shop data: kept out of Google until checked by hand.
    noIndex: isShoeFeedImport(shoe),
  });
}

/** Same kind and age group, checked models first; never filled up with unknown kinds. */
function similar(shoe: Shoe): Shoe[] {
  if (shoe.category.value === 'onbekend') return [];
  return getShoes({ includeImported: true })
    .filter((s) => s.slug !== shoe.slug && s.category.value === shoe.category.value && s.ageGroup === shoe.ageGroup)
    .slice(0, 3);
}

export default async function ShoePage({ params }: { params: Promise<{ slug: string }> }) {
  const shoe = getShoeBySlug((await params).slug);
  if (!shoe) notFound();

  const now = new Date();
  // Offers only for prices shown in "Waar te koop" and at most 14 days old; no review or rating schema.
  // Product snippets need one of offers, review or aggregateRating, so without a current price there
  // is no Product block at all, instead of an item Search Console reports as invalid (decision log 2026-11-12).
  const fresh = getShoeOffers(shoe).filter((o) => isPriceFresh(o, now) && o.priceEur !== null);
  const prices = fresh.map((o) => o.priceEur as number);
  const offers =
    fresh.length === 1 && fresh[0]
      ? {
          '@type': 'Offer',
          price: fresh[0].priceEur?.toFixed(2),
          priceCurrency: 'EUR',
          availability: fresh[0].inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: RETAILERS[fresh[0].retailer].label },
        }
      : fresh.length > 1
        ? {
            '@type': 'AggregateOffer',
            lowPrice: Math.min(...prices).toFixed(2),
            highPrice: Math.max(...prices).toFixed(2),
            offerCount: fresh.length,
            priceCurrency: 'EUR',
          }
        : null;
  const image = shoeImageUrl(shoe);
  const jsonLd = offers && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${shoe.brand} ${shoe.model}`,
    brand: { '@type': 'Brand', name: shoe.brand },
    category: 'Hockeyschoenen',
    url: absoluteUrl(shoePath(shoe)),
    ...(image && { image }),
    offers,
  };
  const checks = checksFor(shoe);
  const others = similar(shoe);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Hockeyschoenen', href: SHOES_PATH },
          { label: `${shoe.brand} ${shoe.model}`, href: shoePath(shoe) },
        ]}
      />
      <div className="flex items-start gap-6">
        <ShoeImage shoe={shoe} className="h-40 w-40 shrink-0 bg-krijt sm:h-48 sm:w-48" />
        <div>
          <p className="text-xs font-semibold tracking-wide text-veld uppercase">{shoe.brand}</p>
          <h1 className="mt-1 text-3xl font-bold">
            {shoe.brand} {shoe.model}
          </h1>
          <p className="mt-2 text-inkt/80">
            {CATEGORY_LABEL[shoe.category.value]} · {AGE_LABEL[shoe.ageGroup]}
          </p>
        </div>
      </div>

      {isShoeFeedImport(shoe) && (
        <p className="mt-6 rounded-2xl border border-rand bg-krijt p-4 text-sm text-inkt/80">{HOCKEYSCHOENEN.model.feedNotice}</p>
      )}
      <ShoeStatus shoe={shoe} />
      <NonMarkingWarning shoe={shoe} />

      <ShoeWhereToBuy shoe={shoe} />

      <section aria-labelledby="controleren-kop" className="mt-10">
        <h2 id="controleren-kop" className="text-2xl font-bold">
          {HOCKEYSCHOENEN.model.checkHeading}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-inkt/80">
          {checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="specs-kop" className="mt-10">
        <h2 id="specs-kop" className="text-2xl font-bold">
          {HOCKEYSCHOENEN.model.specsHeading}
        </h2>
        <ShoeSpecTable shoe={shoe} />
        {shoe.evidenceLimits.length > 0 && (
          <>
            <h3 className="mt-6 text-lg font-bold">{HOCKEYSCHOENEN.model.limitsHeading}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-inkt/80">
              {shoe.evidenceLimits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <FitCheck />
      <ShoeArticleLinks links={shoeArticleLinks()} />

      {others.length > 0 && (
        <section aria-labelledby="vergelijkbaar-kop" className="mt-12">
          <h2 id="vergelijkbaar-kop" className="text-2xl font-bold">
            {HOCKEYSCHOENEN.model.similarHeading}
          </h2>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <ShoeCard shoe={other} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
