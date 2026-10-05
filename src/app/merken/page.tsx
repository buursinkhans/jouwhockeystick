import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { BRAND_PROFILES } from '@/content/brands';
import { Card } from '@/components/ui/Card';

export const metadata = pageMetadata({
  title: 'Merken',
  description:
    'De hockeystickmerken die we vergelijken — Grays, Brabo, JDH, Princess en adidas — met hun belangrijkste kenmerken en Nederlandse hockey-sponsoring.',
  path: '/merken',
});

export default function MerkenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Merken</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-800">
        Op jouwhockeystick.nl vergelijken we sticks van vijf merken: Grays, Brabo, JDH, Princess en
        adidas. Hieronder staat per merk kort wat het kenmerkt, en — waar we dat konden bevestigen
        op officiële bronnen — welke Nederlandse hockeyinternationals het merk sponsort.
      </p>

      <div className="mt-10 space-y-8">
        {BRAND_PROFILES.map((brand) => (
          <Card key={brand.brand}>
            <div className="flex items-center gap-4">
              {brand.logoUrl ? (
                <div
                  className={
                    brand.logoBackground === 'dark'
                      ? 'flex h-14 w-28 shrink-0 items-center justify-center rounded-lg bg-zinc-900 p-2'
                      : 'flex h-14 w-28 shrink-0 items-center justify-center'
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.brand} logo`}
                    className="max-h-10 max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-28 shrink-0 items-center justify-center text-lg font-bold text-zinc-700">
                  {brand.brand}
                </div>
              )}
              <h2 className="text-xl font-bold">{brand.brand}</h2>
            </div>

            <p className="mt-4 text-sm text-zinc-700">
              {brand.characteristics}{' '}
              <a href={brand.characteristicsSourceUrl} className="text-emerald-800 hover:underline">
                (bron)
              </a>
            </p>

            {brand.nationalTeamNote && (
              <p className="mt-3 text-sm text-zinc-700">
                <strong>Nederlands hockeyteam: </strong>
                {brand.nationalTeamNote}{' '}
                {brand.nationalTeamSourceUrl && (
                  <a href={brand.nationalTeamSourceUrl} className="text-emerald-800 hover:underline">
                    (bron)
                  </a>
                )}
              </p>
            )}

            {brand.quotes && brand.quotes.length > 0 && (
              <div className="mt-3 space-y-3">
                {brand.quotes.map((q) => (
                  <blockquote key={q.sourceUrl} className="border-l-2 border-emerald-700 pl-3 text-sm italic text-zinc-700">
                    &ldquo;{q.quote}&rdquo;
                    <footer className="mt-1 not-italic text-xs text-zinc-500">
                      — {q.attribution}
                      {q.language ? ` · ${q.language}` : ''} ·{' '}
                      <a href={q.sourceUrl} className="hover:underline">
                        bron
                      </a>
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm">
              {brand.hasCatalogProducts ? (
                <Link
                  href={`/sticks?brand=${encodeURIComponent(brand.brand)}`}
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  Bekijk alle {brand.brand}-sticks in onze catalogus
                </Link>
              ) : (
                <span className="text-zinc-500">
                  Nog geen {brand.brand}-sticks in onze catalogus (zie open punten).
                </span>
              )}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-zinc-500">
        Alle bovenstaande feiten zijn afkomstig van de officiële merksites, de KNHB of hockey.nl —
        met bronvermelding per claim. We nemen geen sponsoring- of spelersclaim over die we niet
        zelf konden verifiëren.
      </p>
    </div>
  );
}
