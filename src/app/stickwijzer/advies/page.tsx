import Link from 'next/link';
import { adviceAnswersSchema } from '@/advice-engine/answers';
import { getAdvice } from '@/advice-engine/engine';
import { getAllProducts } from '@/catalog';
import { SharedAdvice } from '@/components/stickwijzer/SharedAdvice';
import { pageMetadata } from '@/lib/site';
import { changesSinceShared, readShare, shareHref } from '@/lib/shareAdvice';

// A shared advice is personal: never in Google, never in the sitemap.
export const metadata = pageMetadata({
  title: 'Gedeeld stickadvies',
  description:
    'Een stickadvies dat iemand met je heeft gedeeld, berekend met de stickwijzer van jouwhockeystick.nl.',
  path: '/stickwijzer/advies',
  noIndex: true,
});

// Recalculated on every visit, so prices and stock are those of today.
export const dynamic = 'force-dynamic';

export default async function SharedAdvicePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string | string[]; s?: string | string[] }>;
}) {
  const shared = readShare(await searchParams);
  const parsed = shared ? adviceAnswersSchema.safeParse(shared.answers) : null;

  if (!shared || !parsed?.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold">Gedeeld stickadvies</h1>
        <p className="mt-4 text-inkt/80">
          Deze link werkt niet (meer). Misschien is hij niet helemaal
          meegekopieerd. Je kunt de stickwijzer ook zelf invullen: dat duurt een
          paar minuten.
        </p>
        <Link
          href="/stickwijzer"
          className="mt-6 inline-flex rounded-full bg-bal px-5 py-3 text-sm font-semibold text-inkt hover:bg-bal/90"
        >
          Start de stickwijzer
        </Link>
      </div>
    );
  }

  const now = new Date();
  const products = getAllProducts(now, { includeImported: true });
  const advice = getAdvice(parsed.data, products);
  const changes = changesSinceShared(
    shared.slugs,
    advice.results.map((item) => item.product.slug),
    (slug) => products.find((product) => product.slug === slug),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Gedeeld stickadvies</h1>
      <p className="mt-2 text-inkt/80">
        Iemand heeft dit advies uit de{' '}
        <Link
          href="/stickwijzer"
          className="font-semibold text-veld hover:underline"
        >
          stickwijzer
        </Link>{' '}
        met je gedeeld. Prijzen en voorraad zijn die van vandaag.
      </p>
      {changes.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Sinds het delen is er iets veranderd.</p>
          <ul className="mt-1 list-disc pl-5">
            {changes.map((change) => (
              <li key={change.slug}>
                {change.name ?? 'Een geadviseerde stick'}{' '}
                {change.available
                  ? 'past nu minder goed dan andere sticks, bijvoorbeeld door een andere prijs of voorraad.'
                  : 'is niet meer leverbaar.'}
              </li>
            ))}
          </ul>
          <p className="mt-1">
            Hieronder zie je het advies zoals het vandaag is.
          </p>
        </div>
      )}
      <div className="mt-8">
        <SharedAdvice
          advice={advice}
          adviceGoal={parsed.data.advice_goal}
          changed={changes.length > 0}
          shareHref={shareHref(
            parsed.data,
            advice.results.map((item) => item.product.slug),
          )}
        />
      </div>
    </div>
  );
}
