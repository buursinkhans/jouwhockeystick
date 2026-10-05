import { pageMetadata } from '@/lib/site';
import { CATALOG_VERSION } from '@/catalog';
import { ADVICE_VERSION, RULE_SET_VERSION } from '@/advice-engine/ruleSetVersion';
import { ROUTE_WEIGHTS } from '@/advice-engine/scoring';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import { METHODIEK, WEIGHT_LABELS } from '@/content/methodiek';
import { GROWTH_WARNING, formatInch } from '@/content/stickwijzer/resultCopy';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = pageMetadata({
  title: METHODIEK.title,
  description: METHODIEK.metaDescription,
  path: '/methodiek',
});

const WEIGHT_KEYS = Object.keys(WEIGHT_LABELS) as Array<keyof typeof WEIGHT_LABELS>;

export default function MethodiekPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">{METHODIEK.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Door {METHODIEK.author} · gepubliceerd op{' '}
        <time dateTime={METHODIEK.publishedAt}>{METHODIEK.publishedAt}</time> · laatst gewijzigd op{' '}
        <time dateTime={METHODIEK.updatedAt}>{METHODIEK.updatedAt}</time>
      </p>
      <div className="mt-6 space-y-4 text-zinc-800">
        {METHODIEK.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Drie adviesroutes</h2>
      <dl className="mt-4 space-y-3">
        {METHODIEK.routes.map((route) => (
          <div key={route.name}>
            <dt className="font-semibold">{route.name}</dt>
            <dd className="text-zinc-700">{route.body}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-zinc-700">
        We stellen een route voor op basis van leeftijdsgroep en ervaring, maar jij bepaalt welke route je
        volgt.
      </p>

      <h2 className="mt-10 text-xl font-bold">Lengteadvies</h2>
      <p className="mt-3 text-zinc-700">
        De sticklengte leiden we af van de lichaamslengte met schoenen aan. De tabel is een indicatie: op de
        grens tussen twee maten noemen we beide. {GROWTH_WARNING}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Indicatieve sticklengte per lichaamslengte</caption>
          <thead>
            <tr className="border-b border-zinc-300">
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
              <tr key={band.minCm} className="border-b border-zinc-200">
                <td className="py-2 pr-4">
                  {band.minCm}–{band.maxCm} cm
                </td>
                <td className="py-2">{band.sizes.map(formatInch).join(' of ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-bold">Wanneer we een stick niet adviseren</h2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-zinc-700">
        {METHODIEK.hardFilters.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-bold">Hoe we de overgebleven sticks wegen</h2>
      <p className="mt-3 text-zinc-700">
        Elke stick krijgt maximaal 100 punten. De verdeling verschilt per route: bij beginners weegt maat
        en controle zwaarder, bij gevorderden de gewenste acties.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Puntenverdeling per adviesroute</caption>
          <thead>
            <tr className="border-b border-zinc-300">
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
              <tr key={key} className="border-b border-zinc-200">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {WEIGHT_LABELS[key]}
                </th>
                <td className="py-2 pr-4 text-right">{ROUTE_WEIGHTS.START[key]}</td>
                <td className="py-2 pr-4 text-right">{ROUTE_WEIGHTS.ONTWIKKEL[key]}</td>
                <td className="py-2 text-right">{ROUTE_WEIGHTS.PRESTATIE[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-zinc-700">{METHODIEK.independence}</p>

      <h2 className="mt-10 text-xl font-bold">Maximaal drie aanbevelingen</h2>
      <dl className="mt-4 space-y-3">
        {METHODIEK.roles.map((role) => (
          <div key={role.name}>
            <dt className="font-semibold">{role.name}</dt>
            <dd className="text-zinc-700">{role.body}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-xl font-bold">Bronnen en labels</h2>
      <dl className="mt-4 space-y-3">
        {METHODIEK.sourceLabels.map((label) => (
          <div key={label.name}>
            <dt className="font-semibold">{label.name}</dt>
            <dd className="text-zinc-700">{label.body}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 space-y-4 text-zinc-800">
        {METHODIEK.closing.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Huidige versie: {ADVICE_VERSION} · adviesregels {RULE_SET_VERSION} · catalogus {CATALOG_VERSION}
      </p>
      <div className="mt-6">
        <ButtonLink href="/stickwijzer">Start de stickwijzer</ButtonLink>
      </div>
    </div>
  );
}
