import Link from 'next/link';
import { getIndoorProducts } from '@/catalog';
import { ZAAL, ZAAL_SOURCES } from '@/content/zaal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { IndoorSelector } from '@/components/zaal/IndoorSelector';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import { absoluteUrl, pageMetadata, SITE_NAME } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Zaalsticks',
  description: ZAAL.metaDescription,
  path: '/zaalsticks',
});

export default function ZaalsticksPage() {
  const products = [...getIndoorProducts()].sort(
    (a, b) => a.priceIndicativeEur.value - b.priceIndicativeEur.value,
  );

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        <time dateTime={ZAAL.publishedAt}>{ZAAL.publishedAt}</time>
      </p>
      <p className="mt-5 max-w-3xl text-lg text-inkt/80">{ZAAL.intro}</p>

      <section className="mt-10" aria-labelledby="zaal-selector-heading">
        <h2 id="zaal-selector-heading" className="text-2xl font-bold">
          {ZAAL.selector.heading}
        </h2>
        <p className="mt-2 max-w-3xl text-inkt/80">{ZAAL.selector.intro}</p>
        <div className="mt-5">
          <IndoorSelector products={products} />
        </div>
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
        <h2 className="text-2xl font-bold">{ZAAL.catalogHeading}</h2>
        <p className="mt-3 flex max-w-3xl items-start gap-2 rounded-xl bg-white p-4 text-sm text-inkt/80 ring-1 ring-rand">
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-veld" />
          {ZAAL.stickwijzerNote}
        </p>
        <div className="mt-6">
          <ProductGrid products={products} />
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
