import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { ADVICE_VERSION } from '@/advice-engine/ruleSetVersion';
import { StickwijzerLoader } from '@/components/stickwijzer/StickwijzerLoader';

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
      <p className="mt-2 text-zinc-700">
        Beantwoord een paar vragen over lengte, ervaring, speelwensen en budget.
        Je krijgt maximaal drie sticks met per stick de redenen, de afweging en
        de bronnen. Het advies is een hulpmiddel, geen garantie, en positie is
        nooit de beslissende factor.
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        Je hebt geen account nodig. We vragen geen naam, e-mailadres of
        geboortedatum.{' '}
        <Link
          href="/methodiek"
          className="font-semibold text-emerald-800 hover:underline"
        >
          Hoe komt ons advies tot stand?
        </Link>
      </p>
      <div className="mt-8">
        <StickwijzerLoader />
      </div>
      <p className="mt-8 text-xs text-zinc-500">{ADVICE_VERSION}</p>
    </div>
  );
}
