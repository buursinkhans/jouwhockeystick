import { absoluteUrl, pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllBrands, getFieldProducts, isFeedImport } from '@/catalog';
import { pickVaried } from '@/catalog/picks';
import { isJuniorStick } from '@/catalog/similar';
import type { Brand } from '@/catalog/types';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ImportedSticks } from '@/components/catalog/ImportedSticks';
import { getCatalogStats } from '@/catalog/stats';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { InlineText } from '@/components/article/InlineText';
import { plainText } from '@/components/article/inlineMarkup';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VELD, veldFaq } from '@/content/veld';
import { jsonLdHtml } from '@/lib/jsonLd';

export const metadata = pageMetadata({
  title: VELD.seoTitle,
  description: VELD.metaDescription,
  path: '/sticks',
});

function isValidBrand(
  value: string | undefined,
  brands: Brand[],
): value is Brand {
  return value !== undefined && brands.includes(value as Brand);
}

export default async function SticksPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const now = new Date();
  const brands = getAllBrands(now, 'veld', { includeImported: true });
  const activeBrand = isValidBrand(brand, brands) ? brand : undefined;
  const allProducts = getFieldProducts(now, { includeImported: true });
  // With a brand chosen, every stick of that brand (the list is short).
  // Without, only the hand-checked sticks are in the HTML; the imported ones
  // load after a click (ImportedSticks), which keeps the page light
  // (decision log 2026-10-24).
  const products = activeBrand
    ? allProducts.filter((p) => p.brand === activeBrand)
    : allProducts.filter((p) => !isFeedImport(p));
  const importedCount = activeBrand
    ? 0
    : allProducts.filter(isFeedImport).length;
  const total = getCatalogStats(now).fieldSticks;
  // The landing blocks only on the unfiltered page; with a brand chosen the
  // visitor wants the list (the canonical stays /sticks either way).
  const showLanding = !activeBrand;
  // Hand-checked sticks only for the picks: their specs come with sources.
  const curated = getFieldProducts(now);
  const faq = veldFaq(
    allProducts,
    curated.filter((p) => !isJuniorStick(p)),
  );

  // Describes only the questions and answers visible on this page.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: absoluteUrl('/sticks'),
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: plainText(item.answer) },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {showLanding && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqJsonLd) }}
        />
      )}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Veldhockeysticks', href: '/sticks' },
        ]}
      />
      <h1 className="text-3xl font-extrabold sm:text-4xl">{VELD.title}</h1>
      <p className="mt-2 text-sm text-lijngrijs">
        Door {VELD.author} · gepubliceerd op{' '}
        <time dateTime={VELD.publishedAt}>{VELD.publishedAt}</time> · bijgewerkt
        op <time dateTime={VELD.updatedAt}>{VELD.updatedAt}</time>
      </p>
      <TrackedBlock page="sticks" block="intro">
        <p className="mt-5 max-w-3xl text-lg text-inkt/80">
          <InlineText text={VELD.intro} />
        </p>
      </TrackedBlock>

      {showLanding && (
        <section className="mt-10" aria-labelledby="veld-levels-heading">
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
        <section className="mt-12 max-w-3xl" aria-labelledby="veld-faq-heading">
          <h2 id="veld-faq-heading" className="text-2xl font-bold">
            {VELD.faq.heading}
          </h2>
          <TrackedBlock page="sticks" block="faq">
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
          </TrackedBlock>
        </section>
      )}

      <h2
        id="alle-veldsticks"
        className="mt-12 scroll-mt-24 text-2xl font-bold"
      >
        Alle veldhockeysticks in onze catalogus
      </h2>
      <p className="mt-2 max-w-2xl text-lijngrijs">
        Filter op merk. Zoek je een stick voor de zaal? Bekijk dan de{' '}
        <Link
          href="/zaalsticks"
          className="font-semibold text-veld hover:underline"
        >
          zaalsticks
        </Link>
        .
      </p>

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

      <h3 className="mt-8 text-xl font-bold">
        {activeBrand ? `${activeBrand}-veldsticks` : 'Alle veldsticks'}{' '}
        <span className="font-normal text-lijngrijs">
          ({activeBrand ? products.length : total})
        </span>
      </h3>
      <div className="mt-4">
        <ProductGrid products={products} />
      </div>
      <ImportedSticks
        page="sticks"
        file="aanbod-veld.json"
        count={importedCount}
      />
    </div>
  );
}
