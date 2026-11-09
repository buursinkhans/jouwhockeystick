import Link from 'next/link';
import { getIndoorProducts, isFeedImport } from '@/catalog';
import { indoorItem } from '@/catalog/indoorItems';
import { getOffers } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import { ZAAL, ZAAL_SOURCES } from '@/content/zaal';
import { ProductCard } from '@/components/catalog/ProductCard';
import { IndoorFinder } from '@/components/zaal/IndoorFinder';
import { FaqSection } from '@/components/article/FaqSection';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';
import { InlineText } from '@/components/article/InlineText';
import { absoluteUrl, pageMetadata, SITE_NAME } from '@/lib/site';
import { itemListJsonLd, jsonLdHtml } from '@/lib/jsonLd';

export const metadata = pageMetadata({
  title: ZAAL.seoTitle,
  description: ZAAL.metaDescription,
  path: '/zaalsticks',
});

/**
 * /zaalsticks (redesign 2026-11-09): a short header, the finder that filters
 * the one list of indoor sticks, then the advice and background. Without an
 * answer the list shows the hand-checked sticks, server-rendered, so search
 * engines and AI crawlers read the same sticks, advice and sources as before.
 */
export default function ZaalsticksPage() {
  const now = new Date();
  const allProducts = getIndoorProducts(now, { includeImported: true });
  const checked = allProducts.filter((p) => !isFeedImport(p));
  // Only the hand-checked sticks go to the browser with the page; the shop-feed
  // sticks load after the first answer (/data/zaal-index.json, decision log 2026-10-24).
  const items = checked.map((product) => indoorItem(product, now));
  const importedCount = allProducts.length - checked.length;
  // Server-rendered cards of the hand-checked sticks; the finder only decides which show.
  const checkedCards = Object.fromEntries(
    checked.map((product) => [product.slug, <ProductCard key={product.slug} product={product} placement="zaalkeuze" showLengths compact />]),
  );
  const brands = new Set(allProducts.map((p) => p.brand)).size;
  const shops = new Set(allProducts.flatMap((p) => getOffers(p).map((o) => o.retailer))).size;

  const prices = allProducts.map((p) => p.priceIndicativeEur.value);
  const euro = (value: number) => `€${Math.round(value)}`;
  const faq = [
    ...ZAAL.faq.items,
    ...(prices.length
      ? [
          {
            question: ZAAL.faq.price.question,
            answer: ZAAL.faq.price.answer(prices.length, euro(Math.min(...prices)), euro(Math.max(...prices))),
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
  // The hand-checked sticks in the HTML, as links (no Product markup on an overview, as on /sticks).
  const itemList = itemListJsonLd(
    'Zaalhockeysticks met de hand nagekeken',
    absoluteUrl('/zaalsticks'),
    [...checked]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((product) => ({ name: product.name, url: absoluteUrl(productPath(product)) })),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(itemList) }} />
      <PageHeader
        eyebrow="Zaalhockey"
        title={ZAAL.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: ZAAL.navLabel, href: '/zaalsticks' },
        ]}
      >
        <p className="max-w-3xl text-lg text-inkt/80">{ZAAL.intro}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-inkt" aria-label="Op deze pagina">
          <li className="flex items-center gap-1.5">
            <CheckIcon size={16} className="text-veld" />
            {allProducts.length} zaalsticks van {brands} merken
          </li>
          <li className="flex items-center gap-1.5">
            <CheckIcon size={16} className="text-veld" />
            Winkelprijzen van {shops} partnerwinkels
          </li>
        </ul>
        <a href="#zaal-selector-heading" className={`${buttonBaseClasses} ${buttonVariantClasses.primary} mt-5`}>
          {ZAAL.finder.heading}
          <span aria-hidden="true">↓</span>
        </a>
        <p className="mt-5 text-sm text-lijngrijs">
          Door {ZAAL.author} · gepubliceerd op <time dateTime={ZAAL.publishedAt}>{ZAAL.publishedAt}</time> · bijgewerkt op{' '}
          <time dateTime={ZAAL.updatedAt}>{ZAAL.updatedAt}</time>
        </p>
      </PageHeader>

      <PageBody>
        <section aria-labelledby="zaal-selector-heading">
          <h2 id="zaal-selector-heading" className="scroll-mt-24 text-2xl font-bold">
            {ZAAL.finder.heading}
          </h2>
          <p className="mt-1 max-w-3xl text-inkt/80">{ZAAL.finder.intro}</p>
          <div className="mt-4">
            <IndoorFinder items={items} checkedCards={checkedCards} importedCount={importedCount} />
          </div>
          <p className="mt-6 flex max-w-3xl items-start gap-2 text-sm text-inkt/80">
            <InfoIcon size={18} className="mt-0.5 shrink-0 text-veld" />
            {ZAAL.stickwijzerNote}
          </p>
        </section>

        <section className="mt-16" aria-labelledby="zaal-wie-heading">
          <h2 id="zaal-wie-heading" className="text-2xl font-bold">
            {ZAAL.whoFits.heading}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ZAAL.whoFits.items.map((item) => (
              <div key={item.title} className="card p-5">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-inkt/80">
                  <InlineText text={item.body} />
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-lijngrijs">
            {ZAAL.whoFits.note}{' '}
            <Link href="/methodiek" className="underline">
              Zo werkt ons advies
            </Link>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">{ZAAL.differences.heading}</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {ZAAL.differences.items.map((item) => (
              <li key={item.title} className="flex h-full flex-col card p-5">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-inkt/80">{item.body}</p>
                <p className="mt-auto pt-4 text-xs text-lijngrijs">Onafhankelijke bron — {item.source}</p>
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
            Onafhankelijke bron — FIH Rules of Indoor Hockey en Rules of Hockey, regels 2.17 en 2.18 en de stickspecificatie ·
            Fabrikantgegevens — Grays
          </p>
        </section>

        <section className="mt-12 rounded-3xl border border-rand bg-krijt p-6 sm:p-8">
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

        {/* Visible questions and their FAQPage markup from one source (FaqSection). */}
        <FaqSection id="zaal-faq-heading" heading={ZAAL.faq.heading} items={faq} url={absoluteUrl('/zaalsticks')} />

        <p className="mt-10 max-w-3xl text-inkt/80">
          <InlineText text={ZAAL.shoesNote} />
        </p>

        <section className="mt-12 max-w-3xl" aria-labelledby="zaal-werkwijze-heading">
          <h2 id="zaal-werkwijze-heading" className="text-2xl font-bold">
            {ZAAL.howWeWork.heading}
          </h2>
          <ul className="mt-4 space-y-3 text-inkt/80">
            {ZAAL.howWeWork.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckIcon size={16} className="mt-1 shrink-0 text-veld" />
                <span>
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 max-w-3xl border-t border-rand pt-8">
          <h2 className="text-xl font-bold">Bronnen</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-inkt/80">
            {Object.values(ZAAL_SOURCES).map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener noreferrer" className="text-veld underline">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-lijngrijs">
            Laatst gewijzigd op <time dateTime={ZAAL.updatedAt}>{ZAAL.updatedAt}</time>
          </p>
        </section>
      </PageBody>
    </>
  );
}
