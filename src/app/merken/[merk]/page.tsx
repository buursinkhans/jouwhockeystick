import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOffers } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import { BRAND_PAGES, brandPagePath, evaluateBrandPage, getBrandPage } from '@/catalog/brandPages';
import { BRAND_PROFILES } from '@/content/brands';
import { brandDescription, brandFaq, brandIntro, brandReadMore, brandTitle } from '@/content/brandPage';
import { FaqSection } from '@/components/article/FaqSection';
import { InlineText } from '@/components/article/InlineText';
import { BrandProfile } from '@/components/brand/BrandProfile';
import { BrandStickTable } from '@/components/brand/BrandStickTable';
import { BrandTracking } from '@/components/brand/BrandTracking';
import { OfferFoot } from '@/components/offers/WhereToBuy';
import { ButtonLink } from '@/components/ui/Button';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { TermHelp } from '@/components/ui/TermHelp';
import { itemListJsonLd, jsonLdHtml } from '@/lib/jsonLd';
import { absoluteUrl, pageMetadata } from '@/lib/site';

/** Only the brands in brandPageDefinitions.ts: any other address is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return BRAND_PAGES.map((b) => ({ merk: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ merk: string }> }): Promise<Metadata> {
  const definition = getBrandPage((await params).merk);
  if (!definition) return {};
  const evaluation = evaluateBrandPage(definition);
  return pageMetadata({
    title: brandTitle(evaluation),
    description: brandDescription(evaluation),
    path: brandPagePath(definition.slug),
    // The gate against thin pages (src/catalog/brandPages.ts): not complete enough, not indexed.
    noIndex: !evaluation.indexable,
  });
}

export default async function BrandPage({ params }: { params: Promise<{ merk: string }> }) {
  const definition = getBrandPage((await params).merk);
  if (!definition) notFound();
  const now = new Date();
  const evaluation = evaluateBrandPage(definition, now);
  const { brand } = definition;
  const title = brandTitle(evaluation);
  const profile = BRAND_PROFILES.find((p) => p.brand === brand);
  const faq = brandFaq(evaluation, now);
  const url = absoluteUrl(brandPagePath(definition.slug));
  const fieldPage = evaluation.counts.field > 0;

  return (
    <>
      <PageHeader
        eyebrow="Merk"
        title={title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Merken', href: '/merken' },
          { label: `${brand} hockeysticks`, href: brandPagePath(definition.slug) },
        ]}
      >
        <p className="lead">{brandIntro(evaluation)}</p>
      </PageHeader>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            itemListJsonLd(
              `${brand} hockeysticks in onze catalogus`,
              url,
              evaluation.sticks.map((p) => ({ name: p.name, url: absoluteUrl(productPath(p)) })),
            ),
          ),
        }}
      />

      <PageBody>
        <BrandTracking merk={definition.slug}>
          <section aria-labelledby="keuzehulp-kop">
            <h2 id="keuzehulp-kop" className="text-2xl font-bold">
              Welke past bij wat je zoekt?
            </h2>
            <p className="mt-2 max-w-3xl text-inkt/80">
              Per groep van beginner naar ervaren en van weinig naar veel carbon. Het niveau is de aanduiding van de bron of onze
              eigen inschatting, en een hoger niveau of meer carbon is niet automatisch beter. Zonder zeker te weten wat past: de{' '}
              <Link href={fieldPage ? '/stickwijzer' : '/zaalsticks'} className="font-semibold text-veld hover:underline">
                {fieldPage ? 'stickwijzer' : 'zaalkeuze'}
              </Link>{' '}
              geeft een advies op jouw spel.
            </p>

            {evaluation.groups.map((group) => (
              <div key={group.key} className="mt-8">
                <h3 className="text-xl font-bold">{group.label}</h3>
                <BrandStickTable caption={`${group.label} van ${brand}`} sticks={group.sticks} now={now} />
              </div>
            ))}

            {evaluation.others.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold">Overige modellen</h3>
                <BrandStickTable caption={`Overige ${brand}-sticks`} sticks={evaluation.others} now={now} />
              </div>
            )}

            <div className="mt-4 max-w-3xl">
              <OfferFoot offers={evaluation.sticks.flatMap((p) => getOffers(p))} now={now} />
            </div>

            <div className="mt-4 max-w-3xl">
              <TermHelp terms={['bow', 'carbon']} label="Wat betekenen kromming en carbon?" />
            </div>
          </section>

          {evaluation.notComplete.length > 0 && (
            <section className="mt-12 max-w-3xl" aria-labelledby="nog-niet-kop">
              <h2 id="nog-niet-kop" className="text-2xl font-bold">
                Nog niet in de tabel
              </h2>
              <p className="mt-2 text-inkt/80">
                Deze {brand}-sticks staan in onze catalogus, maar een of meer gegevens ontbreken. Ze staan daarom niet in de
                tabellen; verzonnen waarden zetten we er niet in.
              </p>
              <ul className="mt-4 space-y-2">
                {evaluation.notComplete.map(({ product, reasons }) => (
                  <li key={product.slug}>
                    <Link href={productPath(product)} className="font-semibold text-veld hover:underline">
                      {product.name}
                    </Link>
                    <span className="text-inkt/80">: {reasons.join('; ')}.</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile && <BrandProfile profile={profile} />}

          <section className="mt-12 max-w-3xl" aria-labelledby="meer-modellen-kop">
            <h2 id="meer-modellen-kop" className="text-2xl font-bold">
              Meer {brand}-modellen
            </h2>
            <p className="mt-2 text-inkt/80">
              Naast deze sticks voert de catalogus meer {brand}-modellen waarvan de gegevens uit de winkelomschrijving komen en
              nog niet met de hand zijn gecontroleerd.{' '}
              {fieldPage && (
                <Link href={`/sticks?brand=${encodeURIComponent(brand)}`} className="font-semibold text-veld hover:underline">
                  Alle {brand}-veldsticks
                </Link>
              )}
              {fieldPage && evaluation.counts.indoor > 0 && ' · '}
              {evaluation.counts.indoor > 0 && (
                <Link href="/zaalsticks" className="font-semibold text-veld hover:underline">
                  Zaalsticks
                </Link>
              )}
            </p>
          </section>

          <FaqSection id="faq-kop" heading="Veelgestelde vragen" items={faq} url={url} className="mt-12 max-w-3xl" />

          <section className="mt-12 max-w-3xl" aria-labelledby="meer-kop">
            <h2 id="meer-kop" className="text-2xl font-bold">
              Meer lezen en hulp bij je keuze
            </h2>
            <ul className="mt-4 space-y-2">
              {brandReadMore(evaluation).map((link) => (
                <li key={link.href}>
                  <InlineText text={`[${link.label}](${link.href})`} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ButtonLink href="/merken" variant="secondary">
                Alle merken
              </ButtonLink>
            </div>
          </section>
        </BrandTracking>
      </PageBody>
    </>
  );
}
