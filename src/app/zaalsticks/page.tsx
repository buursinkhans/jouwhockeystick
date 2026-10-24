import Link from 'next/link';
import { getIndoorProducts, isFeedImport } from '@/catalog';
import { INDOOR_TIERS, tierPicks } from '@/catalog/indoorTiers';
import type { Product } from '@/catalog/types';
import { ZAAL, ZAAL_SOURCES } from '@/content/zaal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ImportedSticks } from '@/components/catalog/ImportedSticks';
import { IndoorSelector } from '@/components/zaal/IndoorSelector';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import { InlineText } from '@/components/article/InlineText';
import { absoluteUrl, pageMetadata, SITE_NAME } from '@/lib/site';
import { jsonLdHtml } from '@/lib/jsonLd';

export const metadata = pageMetadata({
  title: ZAAL.seoTitle,
  description: ZAAL.metaDescription,
  path: '/zaalsticks',
});

export default function ZaalsticksPage() {
  const byPrice = (a: Product, b: Product) =>
    a.priceIndicativeEur.value - b.priceIndicativeEur.value;
  // The selector runs in the browser, so it gets the curated sticks only (a
  // small payload); the list below shows every indoor stick, imports included.
  const products = [...getIndoorProducts()].sort(byPrice);
  const allProducts = [
    ...getIndoorProducts(new Date(), { includeImported: true }),
  ].sort(byPrice);

  const prices = allProducts.map((p) => p.priceIndicativeEur.value);
  const euro = (value: number) => `€${Math.round(value)}`;
  const faq = [
    ...ZAAL.faq.items,
    ...(prices.length
      ? [
          {
            question: ZAAL.faq.price.question,
            answer: ZAAL.faq.price.answer(
              prices.length,
              euro(Math.min(...prices)),
              euro(Math.max(...prices)),
            ),
          },
        ]
      : []),
  ];

  // Describes only what is visible on this page: the article and its author.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: ZAAL.title,
    author: { '@type': 'Organization', name: ZAAL.author },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: ZAAL.publishedAt,
    dateModified: ZAAL.updatedAt,
    description: ZAAL.metaDescription,
    mainEntityOfPage: absoluteUrl('/zaalsticks'),
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
          { label: ZAAL.navLabel, href: '/zaalsticks' },
        ]}
      />
      <h1 className="text-3xl font-extrabold sm:text-4xl">{ZAAL.title}</h1>
      <p className="mt-2 text-sm text-lijngrijs">
        Door {ZAAL.author} · gepubliceerd op{' '}
        <time dateTime={ZAAL.publishedAt}>{ZAAL.publishedAt}</time> · bijgewerkt
        op <time dateTime={ZAAL.updatedAt}>{ZAAL.updatedAt}</time>
      </p>
      <p className="mt-5 max-w-3xl text-lg text-inkt/80">{ZAAL.intro}</p>

      <section className="mt-6" aria-labelledby="zaal-selector-heading">
        <h2 id="zaal-selector-heading" className="text-xl font-bold">
          {ZAAL.selector.heading}
        </h2>
        <p className="mt-1 text-sm text-inkt/80">{ZAAL.selector.intro}</p>
        <div className="mt-3">
          <IndoorSelector products={products} />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="zaal-picks-heading">
        <h2 id="zaal-picks-heading" className="text-2xl font-bold">
          {ZAAL.picks.heading}
        </h2>
        <p className="mt-2 max-w-3xl text-inkt/80">{ZAAL.picks.intro}</p>
        {INDOOR_TIERS.map((tier) => {
          // Hand-checked sticks only: their specs come with sources.
          const picks = tierPicks(products, tier);
          return picks.length ? (
            <div key={tier.id} className="mt-6">
              <h3 className="text-lg font-semibold">{tier.heading}</h3>
              <div className="mt-3">
                <ProductGrid products={picks} />
              </div>
            </div>
          ) : null;
        })}
        <p className="mt-6">
          <a
            href="#alle-zaalsticks"
            className="font-semibold text-veld hover:underline"
          >
            {ZAAL.picks.allLink} ({allProducts.length}) ↓
          </a>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{ZAAL.differences.heading}</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {ZAAL.differences.items.map((item) => (
            <li
              key={item.title}
              className="flex h-full flex-col rounded-2xl border border-rand bg-white p-5"
            >
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-inkt/80">{item.body}</p>
              <p className="mt-auto pt-4 text-xs text-lijngrijs">
                Onafhankelijke bron — {item.source}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">{ZAAL.stickRules.heading}</h2>
        <div className="mt-3 space-y-3 text-inkt/80">
          {ZAAL.stickRules.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-2 text-xs text-lijngrijs">
          Onafhankelijke bron — FIH Rules of Indoor Hockey en Rules of Hockey,
          regels 2.17 en 2.18 en de stickspecificatie · Fabrikantgegevens —
          Grays
        </p>
      </section>

      <section className="bg-hex-light mt-12 rounded-3xl border border-rand bg-krijt p-6 sm:p-8">
        <h2 className="text-2xl font-bold">{ZAAL.choosing.heading}</h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {ZAAL.choosing.items.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-veld text-white">
                <CheckIcon size={14} />
              </span>
              <p className="text-inkt/80">
                <span className="block font-bold text-inkt">{item.title}</span>
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-lijngrijs">
          Redactionele adviesregel — {ZAAL.choosing.note}{' '}
          <Link href="/methodiek" className="underline">
            Zo werkt ons advies
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 id="alle-zaalsticks" className="scroll-mt-24 text-2xl font-bold">
          {ZAAL.catalogHeading}
        </h2>
        <p className="mt-3 flex max-w-3xl items-start gap-2 rounded-xl bg-white p-4 text-sm text-inkt/80 ring-1 ring-rand">
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-veld" />
          {ZAAL.stickwijzerNote}
        </p>
        <div className="mt-6">
          {/* Hand-checked sticks in the HTML; the imported ones after a click (decision log 2026-10-24). */}
          <ProductGrid products={allProducts.filter((p) => !isFeedImport(p))} />
        </div>
        <ImportedSticks
          page="zaalsticks"
          file="aanbod-zaal.json"
          count={allProducts.filter(isFeedImport).length}
        />
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="zaal-faq-heading">
        <h2 id="zaal-faq-heading" className="text-2xl font-bold">
          {ZAAL.faq.heading}
        </h2>
        <div className="mt-5 space-y-6">
          {faq.map((item) => (
            <div key={item.question}>
              <h3 className="text-lg font-bold">{item.question}</h3>
              <p className="mt-2 text-inkt/80">
                <InlineText text={item.answer} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl border-t border-rand pt-8">
        <h2 className="text-xl font-bold">Bronnen</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-inkt/80">
          {Object.values(ZAAL_SOURCES).map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                rel="noopener noreferrer"
                className="text-veld underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-lijngrijs">
          Laatst gewijzigd op{' '}
          <time dateTime={ZAAL.updatedAt}>{ZAAL.updatedAt}</time>
        </p>
      </section>
    </div>
  );
}
