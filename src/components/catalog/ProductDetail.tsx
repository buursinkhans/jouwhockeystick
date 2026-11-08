import type { Metadata } from 'next';
import { productPath } from '@/catalog/paths';
import { productMetaDescription } from '@/catalog/metaDescription';
import type { Product } from '@/catalog/types';
import { isPassaSportsOnly, isSoldAtBol } from '@/catalog/shop';
import { getOffers, isPriceFresh, lowestTotal } from '@/catalog/offers';
import { RETAILERS } from '@/lib/retailers';
import { euro, shopCount } from '@/content/offers';
import { OFFER_ANCHOR, WhereToBuy } from '@/components/offers/WhereToBuy';
import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllProducts, getDiscipline, isFeedImport } from '@/catalog';
import { ProductSpecTable } from '@/components/catalog/ProductSpecTable';
import { ProductProsAndCons } from '@/components/catalog/ProductProsAndCons';
import { ProductImage } from '@/components/catalog/ProductImage';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { ButtonLink } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductFitAndSources } from '@/components/catalog/ProductFitAndSources';
import { SimilarSticks } from '@/components/catalog/SimilarSticks';
import { getSimilarSticks } from '@/catalog/similar';
import { getProductFamily } from '@/catalog/family';
import { FamilyTable } from '@/components/catalog/FamilyTable';
import { DISCIPLINE_LABELS } from '@/catalog/labels';
import { getModelYear } from '@/catalog/modelYear';
import { evidenceGaps, sourceMixText } from '@/content/evidence';
import { routeStepRange } from '@/content/stickwijzer/progress';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { absoluteUrl } from '@/lib/site';
import { jsonLdHtml } from '@/lib/jsonLd';

/**
 * The page of one stick, shared by /sticks/[slug] (kept by hand) and
 * /aanbod/[slug] (imported from the PassaHockey feed). The route decides
 * which product it is; links and canonical come from productPath.
 */
export function productPageMetadata(product: Product): Metadata {
  // "review" is deliberately not used: we do not test sticks ourselves.
  return pageMetadata({
    title: `${product.name}: specs en advies`,
    // Built from catalog data, not the summary (decision log 2026-10-23).
    description: productMetaDescription(product),
    path: productPath(product),
    // Feed-imported sticks have template texts: kept out of Google until enriched by hand.
    noIndex: isFeedImport(product),
  });
}

export function ProductDetail({ product }: { product: Product }) {
  const family = product.feedImport
    ? null
    : getProductFamily(product, getAllProducts(new Date()));

  const now = new Date();
  const offers = getOffers(product);
  const lowest = lowestTotal(offers, { size: null, now });
  // The last gap ("niet zelf in de hand gehad") is already in "Bronnen en methode" on this page.
  const gaps = evidenceGaps(product, getModelYear(product) ?? null).slice(0, -1);
  // Offers only for prices visible in "Waar te koop" and at most 14 days old
  // (CLAUDE.md, Prijsvergelijking); the price is the shop's price, shipping
  // is shown apart. No Review or AggregateRating: we have not tested the sticks.
  const fresh = offers.filter((o) => isPriceFresh(o, now) && o.priceEur !== null);
  const prices = fresh.map((o) => o.priceEur as number);
  const offersJsonLd =
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.summary,
    category: DISCIPLINE_LABELS[getDiscipline(product)],
    url: absoluteUrl(productPath(product)),
    ...(product.imageUrl && { image: product.imageUrl }),
    ...(offersJsonLd && { offers: offersJsonLd }),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          getDiscipline(product) === 'zaal'
            ? { label: 'Zaalsticks', href: '/zaalsticks' }
            : { label: 'Veldsticks', href: '/sticks' },
          { label: product.name, href: productPath(product) },
        ]}
      />
      {/*
        Two columns from lg (redesign fase 2): photo, name and details left,
        price and "Waar te koop" right and sticky. The DOM order is header,
        buying, details, so a phone shows them in that order in one column.
      */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-12">
        {/*
          A phone puts the summary under photo and name, over the full width,
          so the price and the first shops reach the first screen (owner,
          2026-11-08). From sm the summary sits beside the photo again.
        */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-6 lg:col-start-1 lg:row-start-1">
          <div className="shrink-0 sm:row-span-2">
            <ProductImage
              product={product}
              className="h-40 w-40 sm:h-64 sm:w-64"
            />
            {product.imageUrl && product.imageSourceUrl && (
              <p className="mt-1 text-center text-xs text-lijngrijs">
                <a href={product.imageSourceUrl} className="hover:underline">
                  Foto: {product.brand}
                </a>
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-veld">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{product.name}</h1>
          </div>
          <p className="col-span-2 mt-4 text-inkt/80 sm:col-span-1 sm:col-start-2">{product.summary}</p>
        </div>

        <aside
          aria-label="Prijs en winkels"
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <div className="lg:sticky lg:top-24">
            {lowest !== null ? (
              // A current shop price exists: say where it starts and point to the shops.
              <p className="mt-6 text-2xl font-bold lg:mt-0">
                <a href={`#${OFFER_ANCHOR}`} className="hover:underline">
                  vanaf {euro(lowest)}
                </a>{' '}
                <span className="text-base font-normal text-inkt/75 lg:block lg:text-sm">
                  bij {shopCount(offers.length)}, incl. verzending
                </span>
              </p>
            ) : (
              <>
                {/* No current shop price: the indicative price stays (CLAUDE.md, Testfase-scope). */}
                <p className="mt-6 text-2xl font-bold lg:mt-0">
                  €{product.priceIndicativeEur.value.toFixed(2)}
                </p>
                <div className="mt-1">
                  <ProductNotice
                    notSoldAtBol={!isSoldAtBol(product)}
                    passaSportsOnly={isPassaSportsOnly(product)}
                    alsoAtPassaSports={product.passaSportsProductUrl !== undefined}
                    alsoAtPlutosport={product.plutosportProductUrl !== undefined}
                    alsoAtHockeyCity={product.hockeyCityProductUrl !== undefined}
                    alsoAtDaka={product.dakaProductUrl !== undefined}
                  />
                </div>
              </>
            )}

            <WhereToBuy product={product} placement="productpagina" variant="full" />

            <div className="mt-6">
              <ButtonLink
                href={`/interesse?product=${product.slug}&source=productpagina`}
                variant="secondary"
              >
                Stel een vraag
              </ButtonLink>
            </div>
            {getDiscipline(product) === 'veld' && (
              // For a visitor who doubts the fit (fase 9); the stickwijzer advises field sticks only.
              <TrackedBlock page="stickpagina" block="stickwijzer">
                <p className="mt-4 text-sm text-inkt/80">
                  Twijfel je of deze stick bij je past?{' '}
                  <Link href="/stickwijzer" className="font-semibold text-veld hover:underline">
                    Doe de stickwijzer
                  </Link>
                  : in {routeStepRange()} weet je de maat en welke sticks passen.
                </p>
              </TrackedBlock>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <h2 className="mt-10 text-xl font-bold">
            Sterke punten &amp; aandachtspunten
          </h2>
          <div className="mt-4">
            <ProductProsAndCons product={product} />
          </div>

          <h2 className="mt-10 text-xl font-bold">Specificaties</h2>
          <div className="mt-4">
            <ProductSpecTable product={product} hasCurrentOffers={lowest !== null} />
          </div>
          {/* How sure we are, in one line under the specs (fase 8); the full list is under "Bronnen en methode". */}
          <p className="mt-3 text-sm text-lijngrijs">
            {sourceMixText(product)}{' '}
            {gaps.join(' ')}
          </p>

          <ProductFitAndSources product={product} />

          {family && <FamilyTable current={product} family={family} />}

          <SimilarSticks
            current={product}
            similar={getSimilarSticks(
              product,
              getAllProducts(new Date(), { includeImported: true }),
            )}
          />

          <p className="mt-6 text-sm">
            <Link
              href={`/vergelijk?a=${product.slug}`}
              className="font-semibold text-veld hover:underline"
            >
              Vergelijk deze stick met een andere
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
