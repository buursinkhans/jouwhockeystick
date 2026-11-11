import Link from 'next/link';
import { pageMetadata } from '@/lib/site';
import { CATALOG_VERSION } from '@/catalog';
import {
  ADVICE_VERSION,
  RULE_SET_VERSION,
} from '@/advice-engine/ruleSetVersion';
import { ROUTE_WEIGHTS } from '@/advice-engine/scoring';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import { METHODE } from '@/content/methode';
import {
  METHODIEK,
  WEIGHT_LABELS,
  methodeVersionLine,
} from '@/content/methodiek';
import { getAllArticles } from '@/content';
import { jsonLdHtml } from '@/lib/jsonLd';
import { methodeJsonLd } from '@/lib/methodeJsonLd';
import { GROWTH_WARNING, formatInch } from '@/content/stickwijzer/resultCopy';
import { ButtonLink } from '@/components/ui/Button';
import { PromiseList } from '@/components/trust/PromiseList';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';

// The method name leads the title (decision log 2026-11-11). The old question
// "Hoe komt ons stickadvies tot stand?" stays on the page as an H2, so that
// search intent is still answered here.
export const metadata = pageMetadata({
  title: METHODE.metaTitle,
  description: METHODE.metaDescription,
  path: '/methodiek',
});

const WEIGHT_KEYS = Object.keys(WEIGHT_LABELS) as Array<
  keyof typeof WEIGHT_LABELS
>;

export default function MethodiekPage() {
  const articles = getAllArticles();
  return (
    <>
      {/* Only what is visible below: the page, the method and its three parts. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(methodeJsonLd()) }}
      />
      <PageHeader width="lezen" eyebrow="Onze methode" title={METHODE.h1}>
        <p className="mt-2 text-sm text-lijngrijs">
          Door {METHODIEK.author} · gepubliceerd op{' '}
          <time dateTime={METHODIEK.publishedAt}>{METHODIEK.publishedAt}</time> ·
          laatst gewijzigd op{' '}
          <time dateTime={METHODIEK.updatedAt}>{METHODIEK.updatedAt}</time>
        </p>
        <div
          id="methode"
          className="mt-6 max-w-2xl scroll-mt-24 rounded-2xl border border-rand bg-white p-5 sm:p-6"
        >
          <p className="text-lg font-semibold text-inkt">{METHODE.kernzin}</p>
          <p className="mt-3 text-sm text-lijngrijs">{methodeVersionLine()}</p>
          <div className="mt-4">
            <ButtonLink href="/stickwijzer">Doe de stickwijzer</ButtonLink>
          </div>
        </div>
      </PageHeader>

      <PageBody width="lezen">
        <h2 className="text-xl font-bold">{METHODE.oneMinuteHeading}</h2>
        <p className="mt-3 text-inkt/80">{METHODE.l100}</p>

        <h2 className="mt-10 text-xl font-bold">{METHODE.partsHeading}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {METHODE.parts.map((part, index) => (
            <section
              key={part.id}
              id={part.id}
              aria-labelledby={`${part.id}-heading`}
              className="card scroll-mt-24 p-5"
            >
              <p className="text-sm font-semibold text-veld">Stap {index + 1}</p>
              <h3 id={`${part.id}-heading`} className="mt-1 text-lg font-bold">
                {part.title}
              </h3>
              <p className="mt-2 text-inkt/80">{part.lead}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-inkt/80">
                {part.counts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-lijngrijs">{part.origin}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {part.articles.map((slug) => {
                  const article = articles.find((a) => a.slug === slug);
                  return article ? (
                    <li key={slug}>
                      <Link
                        href={`/kennis/${slug}`}
                        className="font-semibold text-veld hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </section>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-bold">{METHODE.limitsHeading}</h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-inkt/80">
          {METHODE.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-bold">{METHODIEK.title}</h2>
        <div className="mt-3 max-w-2xl space-y-4 text-inkt/80">
          {METHODIEK.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {/* The promises the homepage links here for, in one place (redesign fase 4). */}
        <section aria-labelledby="afspraken-heading" className="card mt-10 p-5 sm:p-6">
          <h2 id="afspraken-heading" className="text-xl font-bold">Onze afspraken</h2>
          <div className="mt-4">
            <PromiseList currentPath="/methodiek" />
          </div>
        </section>

        <h2 className="mt-10 text-xl font-bold">Drie adviesroutes</h2>
        <dl className="mt-4 space-y-3">
          {METHODIEK.routes.map((route) => (
            <div key={route.name}>
              <dt className="font-semibold">{route.name}</dt>
              <dd className="text-inkt/80">{route.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-inkt/80">
          We stellen een route voor op basis van leeftijdsgroep en ervaring, maar
          jij bepaalt welke route je volgt. De route bepaalt welke vragen we
          stellen; het niveau van het advies halen we uit je antwoorden.
        </p>

        <h2 className="mt-10 text-xl font-bold">Lengteadvies</h2>
        <p className="mt-3 text-inkt/80">
          De sticklengte leiden we af van de lichaamslengte zonder schoenen. De
          tabel is een indicatie: op de grens tussen twee maten noemen we beide.{' '}
          {GROWTH_WARNING}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Indicatieve sticklengte per lichaamslengte
            </caption>
            <thead>
              <tr className="border-b border-lijngrijs">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Lichaamslengte
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Sticklengte
                </th>
              </tr>
            </thead>
            <tbody>
              {LENGTH_GUIDE.map((band) => (
                <tr key={band.minCm} className="border-b border-rand">
                  <td className="py-2 pr-4">
                    {band.minCm}–{band.maxCm} cm
                  </td>
                  <td className="py-2">
                    {band.sizes.map(formatInch).join(' of ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">
          Wanneer we een stick niet adviseren
        </h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-inkt/80">
          {METHODIEK.hardFilters.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-bold">
          Hoe we de overgebleven sticks wegen
        </h2>
        <p className="mt-3 text-inkt/80">{METHODIEK.weightsIntro}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Puntenverdeling per adviesroute</caption>
            <thead>
              <tr className="border-b border-lijngrijs">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Onderdeel
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Start
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Ontwikkel
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Prestatie
                </th>
              </tr>
            </thead>
            <tbody>
              {WEIGHT_KEYS.map((key) => (
                <tr key={key} className="border-b border-rand">
                  <th scope="row" className="py-2 pr-4 font-normal">
                    {WEIGHT_LABELS[key]}
                  </th>
                  <td className="py-2 pr-4 text-right">
                    {ROUTE_WEIGHTS.START[key]}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {ROUTE_WEIGHTS.ONTWIKKEL[key]}
                  </td>
                  <td className="py-2 text-right">
                    {ROUTE_WEIGHTS.PRESTATIE[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-inkt/80">{METHODIEK.independence}</p>

        <h2 id="partnerlinks" className="mt-10 scroll-mt-24 text-xl font-bold">
          Partnerlinks
        </h2>
        <p className="mt-3 text-inkt/80">{METHODIEK.partnerLinks}</p>
        <p className="mt-2 text-inkt/80">
          <Link
            href="/kennis/waar-koop-je-een-hockeystick"
            className="font-semibold text-veld hover:underline"
          >
            Het verschil tussen bol.com, PassaHockey, Plutosport, HockeyCity en Daka
          </Link>
        </p>

        <h2 className="mt-10 text-xl font-bold">Maximaal drie aanbevelingen</h2>
        <dl className="mt-4 space-y-3">
          {METHODIEK.roles.map((role) => (
            <div key={role.name}>
              <dt className="font-semibold">{role.name}</dt>
              <dd className="text-inkt/80">{role.body}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-xl font-bold">Bronnen en labels</h2>
        <dl className="mt-4 space-y-3">
          {METHODIEK.sourceLabels.map((label) => (
            <div key={label.name}>
              <dt className="font-semibold">{label.name}</dt>
              <dd className="text-inkt/80">{label.body}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 space-y-4 text-inkt">
          {METHODIEK.closing.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-8 text-sm text-lijngrijs">
          Huidige versie: {ADVICE_VERSION} · adviesregels {RULE_SET_VERSION} ·
          catalogus {CATALOG_VERSION}
        </p>
        <div className="mt-6">
          <ButtonLink href="/stickwijzer">Start de stickwijzer</ButtonLink>
        </div>
      </PageBody>
    </>
  );
}
