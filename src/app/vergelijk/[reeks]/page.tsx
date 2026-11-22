import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productPath } from '@/catalog/paths';
import { evaluateSeries, getSeries, SERIES, seriesPath } from '@/catalog/series';
import {
  chooseBlocks,
  priceOnlyNote,
  seriesDescription,
  seriesFaq,
  seriesIntro,
  seriesReadMore,
  seriesTitle,
} from '@/content/series';
import { FaqSection } from '@/components/article/FaqSection';
import { InlineText } from '@/components/article/InlineText';
import { SeriesSpecTable } from '@/components/compare/SeriesSpecTable';
import { VersusTracking } from '@/components/compare/VersusTracking';
import { WhereToBuy } from '@/components/offers/WhereToBuy';
import { ButtonLink } from '@/components/ui/Button';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import { absoluteUrl, pageMetadata } from '@/lib/site';

/** Only the series in seriesDefinitions.ts: any other address is a 404, so no endless set of pages exists. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERIES.map((series) => ({ reeks: series.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ reeks: string }> }): Promise<Metadata> {
  const series = getSeries((await params).reeks);
  if (!series) return {};
  const evaluation = evaluateSeries(series);
  return pageMetadata({
    title: seriesTitle(evaluation),
    description: seriesDescription(evaluation),
    path: seriesPath(series.slug),
    // The gate against thin pages (src/catalog/series.ts): not complete enough, not indexed.
    noIndex: !evaluation.indexable,
  });
}

export default async function SeriesPage({ params }: { params: Promise<{ reeks: string }> }) {
  const series = getSeries((await params).reeks);
  if (!series) notFound();
  const evaluation = evaluateSeries(series);
  const title = seriesTitle(evaluation);
  const note = priceOnlyNote(evaluation);
  const blocks = chooseBlocks(evaluation);
  const faq = seriesFaq(evaluation);
  const toolSlugs = evaluation.members.slice(0, 3).map((m) => m.product.slug);
  const toolHref = `/vergelijk?${toolSlugs.map((slug, i) => `${'abc'[i]}=${slug}`).join('&')}`;

  return (
    <>
      <PageHeader
        eyebrow="Vergelijken"
        title={title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Vergelijken', href: '/vergelijk' },
          { label: title, href: seriesPath(series.slug) },
        ]}
      >
        <p className="lead">{seriesIntro(evaluation)}</p>
        {note && <p className="mt-3 text-inkt/80">{note}</p>}
      </PageHeader>

      <PageBody>
        <VersusTracking reeks={series.slug}>
          <section aria-labelledby="kies-kop">
            <h2 id="kies-kop" className="text-2xl font-bold">
              Welke stick past bij wat je zoekt?
            </h2>
            <p className="mt-2 max-w-3xl text-inkt/80">
              Per stick de punten uit onze catalogus waarin de sticks van elkaar verschillen. Het zijn geen testresultaten
              en geen rangorde.
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {blocks.map((block) => (
                <li key={block.slug} className="card p-4">
                  <h3 className="text-lg font-bold">Kies de {block.label} als…</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-inkt/80">
                    {block.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link
                    href={productPath(evaluation.members.find((m) => m.product.slug === block.slug)!.product)}
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-veld hover:underline"
                  >
                    Bekijk de {block.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="gegevens-kop">
            <h2 id="gegevens-kop" className="text-2xl font-bold">
              De gegevens naast elkaar
            </h2>
            <p className="mt-2 mb-4 max-w-3xl text-inkt/80">Rijen waarin de sticks verschillen zijn gemarkeerd.</p>
            <SeriesSpecTable
              members={evaluation.members}
              caption={`Vergelijking van ${evaluation.members.map((m) => m.label).join(', ')}; rijen met een verschil zijn gemarkeerd`}
            />
            <p className="mt-4 text-sm">
              <Link href={toolHref} className="font-semibold text-veld hover:underline">
                Zet {toolSlugs.length === evaluation.members.length ? 'ze' : 'de eerste drie'} naast elkaar in de vergelijker
              </Link>
            </p>
          </section>

          <section className="mt-12" aria-labelledby="prijzen-kop">
            <h2 id="prijzen-kop" className="text-2xl font-bold">
              Prijzen per stick
            </h2>
            <p className="mt-2 max-w-3xl text-inkt/80">
              Per stick de partnerwinkels die hem verkopen, gesorteerd op prijs inclusief verzending. De winkel is de
              verkoper; wij krijgen een vergoeding als je via een link koopt, en dat verandert de volgorde niet.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {evaluation.members.map((m) => (
                <WhereToBuy
                  key={m.product.slug}
                  product={m.product}
                  placement="versus"
                  variant="full"
                  idPrefix={`waar-te-koop-${m.product.slug}`}
                  heading={`Waar te koop: ${m.label}`}
                  headingLevel={3}
                />
              ))}
            </div>
          </section>

          {evaluation.notComparable.length > 0 && (
            <section className="mt-12" aria-labelledby="nog-niet-kop">
              <h2 id="nog-niet-kop" className="text-2xl font-bold">
                Nog niet vergelijkbaar
              </h2>
              <p className="mt-2 max-w-3xl text-inkt/80">
                Deze sticks horen bij dezelfde lijn, maar een of meer gegevens staan niet in onze catalogus. Ze staan
                daarom niet in de tabel; verzonnen waarden zetten we er niet in.
              </p>
              <ul className="mt-4 space-y-2">
                {evaluation.notComparable.map((item) => (
                  <li key={item.slug}>
                    {item.product ? (
                      <Link href={productPath(item.product)} className="font-semibold text-veld hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-semibold">{item.label}</span>
                    )}
                    <span className="text-inkt/80">: {item.reasons.join('; ')}.</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <FaqSection
            id="faq-kop"
            heading="Veelgestelde vragen"
            items={faq}
            url={absoluteUrl(seriesPath(series.slug))}
            className="mt-12 max-w-3xl"
          />

          <section className="mt-12 max-w-3xl" aria-labelledby="meer-kop">
            <h2 id="meer-kop" className="text-2xl font-bold">
              Meer lezen en hulp bij je keuze
            </h2>
            <ul className="mt-4 space-y-2">
              {seriesReadMore(evaluation).map((link) => (
                <li key={link.href}>
                  <InlineText text={`[${link.label}](${link.href})`} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ButtonLink href="/vergelijk" variant="secondary">
                Vergelijk andere sticks
              </ButtonLink>
            </div>
          </section>
        </VersusTracking>
      </PageBody>
    </>
  );
}
