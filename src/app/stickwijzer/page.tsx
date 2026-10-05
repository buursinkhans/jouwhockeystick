import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { ADVICE_VERSION } from '@/advice-engine/ruleSetVersion';
import { StickwijzerLoader } from '@/components/stickwijzer/StickwijzerLoader';
import { QUESTIONS } from '@/content/stickwijzer/questions';

const ROUTE_OPTIONS =
  QUESTIONS.route_self_select.input.kind === 'single'
    ? QUESTIONS.route_self_select.input.options
    : [];

export const metadata = pageMetadata({
  title: 'Stickwijzer',
  description:
    'Keuzehulp voor een hockeystick: een korte route voor een eerste stick en een verdiepende route voor gevorderde spelers. Je ziet per advies de redenen, de afweging en de bronnen.',
  path: '/stickwijzer',
});

export default function StickwijzerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Stickwijzer</h1>
      <p className="mt-2 text-inkt/80">
        Beantwoord een paar vragen over lengte, ervaring, speelwensen en budget.
        Je krijgt maximaal drie sticks met per stick de redenen, de afweging en
        de bronnen. Het advies is een hulpmiddel, geen garantie, en positie is
        nooit de beslissende factor.
      </p>
      <p className="mt-2 text-sm text-lijngrijs">
        Je hebt geen account nodig. We vragen geen naam, e-mailadres of
        geboortedatum.{' '}
        <Link
          href="/methodiek"
          className="font-semibold text-veld hover:underline"
        >
          Hoe komt ons advies tot stand?
        </Link>
      </p>
      <div className="mt-8">
        <StickwijzerLoader />
      </div>

      {/*
        The wizard itself renders in the browser, so the routes are also
        described here in server-rendered HTML for search engines and AI
        systems — the same text the route cards show.
      */}
      <section className="mt-16 border-t border-rand pt-10">
        <h2 className="text-2xl font-bold">Drie routes in de stickwijzer</h2>
        <p className="mt-2 text-inkt/80">
          Een eerste stick vraagt om andere vragen dan een stick voor een
          gevorderde speler. Daarom begint de stickwijzer met de keuze voor een
          route; daarna volgen alleen de vragen die voor die route nodig zijn.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {ROUTE_OPTIONS.map((option) => (
            <div key={option.value}>
              <h3 className="text-lg font-bold">{option.label}</h3>
              <dl className="mt-2 space-y-2 text-sm text-inkt/80">
                {option.details?.map((detail) => (
                  <div key={detail.term}>
                    <dt className="font-semibold text-inkt">{detail.term}</dt>
                    <dd>{detail.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-inkt/80">
          Lees in de{' '}
          <Link
            href="/methodiek"
            className="font-semibold text-veld hover:underline"
          >
            methodiek
          </Link>{' '}
          welke sticks we nooit adviseren, hoe we de rest wegen en welke bronnen
          we gebruiken.
        </p>
      </section>

      <p className="mt-8 text-xs text-lijngrijs">{ADVICE_VERSION}</p>
    </div>
  );
}
