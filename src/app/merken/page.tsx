import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getCatalogStats } from '@/catalog/stats';
import { BRAND_PROFILES } from '@/content/brands';

/** Profiles of the brands that are in the catalog now (src/catalog/stats.ts). */
function catalogProfiles() {
  const inCatalog = new Set<string>(getCatalogStats().brands);
  return BRAND_PROFILES.filter((b) => inCatalog.has(b.brand));
}
import { Card } from '@/components/ui/Card';

export const metadata = pageMetadata({
  title: 'Merken',
  description: `De hockeystickmerken die we vergelijken — ${catalogProfiles()
    .map((b) => b.brand)
    .join(
      ', ',
    )} — met hun belangrijkste kenmerken en Nederlandse hockey-sponsoring.`,
  path: '/merken',
});

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const DUTCH_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDutchDate(isoDate: string): string {
  return DUTCH_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

function joinDutch(items: string[]): string {
  return items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} en ${items.at(-1)}`;
}

export default function MerkenPage() {
  // Count and list only brands that are in the catalog now, so the number
  // matches the homepage and /sticks (src/catalog/stats.ts).
  const stats = getCatalogStats();
  const profiles = catalogProfiles();
  const brandNames = profiles.map((b) => b.brand);
  // The /sticks brand filter only covers field sticks; indoor-only brands
  // link to the indoor page instead.
  const fieldBrands = new Set<string>(stats.fieldBrands);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Merken</h1>
      <p className="mt-4 text-lg leading-relaxed text-inkt">
        Op jouwhockeystick.nl vergelijken we sticks van {brandNames.length}{' '}
        merken: {joinDutch(brandNames)}. Hieronder staat per merk kort wat het
        kenmerkt, hoe het merk zelf over sticks denkt (als het dat op de eigen
        website uitlegt), en — waar we dat konden bevestigen op officiële
        bronnen — welke Nederlandse hockeyinternationals het merk sponsort.
      </p>

      <div className="mt-10 space-y-8">
        {profiles.map((brand) => (
          <Card key={brand.brand}>
            <div className="flex items-center gap-4">
              {brand.logoUrl ? (
                <div
                  className={
                    brand.logoBackground === 'dark'
                      ? 'flex h-14 w-28 shrink-0 items-center justify-center rounded-lg bg-inkt p-2'
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
              ) : null}
              <h2 className="text-xl font-bold">{brand.brand}</h2>
            </div>

            <p className="mt-4 text-sm text-inkt/80">
              {brand.characteristics}{' '}
              <a
                href={brand.characteristicsSourceUrl}
                className="inline-flex min-h-6 items-center text-veld hover:underline"
              >
                (bron)
              </a>
            </p>

            {brand.nationalTeamNote && (
              <p className="mt-3 text-sm text-inkt/80">
                <strong>Nederlands hockeyteam: </strong>
                {brand.nationalTeamNote}{' '}
                {brand.nationalTeamSourceUrl && (
                  <a
                    href={brand.nationalTeamSourceUrl}
                    className="inline-flex min-h-6 items-center text-veld hover:underline"
                  >
                    (bron)
                  </a>
                )}
              </p>
            )}

            {brand.quotes && brand.quotes.length > 0 && (
              <div className="mt-3 space-y-3">
                {brand.quotes.map((q) => (
                  <blockquote
                    key={q.sourceUrl}
                    className="border-l-2 border-veld pl-3 text-sm italic text-inkt/80"
                  >
                    &ldquo;{q.quote}&rdquo;
                    <footer className="mt-1 not-italic text-xs text-lijngrijs">
                      — {q.attribution}
                      {q.language ? ` · ${q.language}` : ''} ·{' '}
                      <a
                        href={q.sourceUrl}
                        className="inline-flex min-h-6 items-center hover:underline"
                      >
                        bron
                      </a>
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}

            {brand.philosophy && (
              <section
                aria-labelledby={`filosofie-${slugify(brand.brand)}`}
                className="mt-5 border-t border-rand pt-4"
              >
                <h3
                  id={`filosofie-${slugify(brand.brand)}`}
                  className="text-base font-bold"
                >
                  Hoe denkt {brand.brand} over sticks?
                </h3>
                {brand.philosophy.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-sm text-inkt/80">
                    {paragraph}
                  </p>
                ))}
                <p className="mt-2 text-xs text-lijngrijs">
                  Zo beschrijft {brand.brand} het zelf op de eigen website
                  (gecontroleerd op{' '}
                  {formatDutchDate(brand.philosophy.checkedAt)}
                  ):{' '}
                  {brand.philosophy.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 && ' · '}
                      <a
                        href={source.url}
                        className="inline-flex min-h-6 items-center hover:underline"
                      >
                        {source.label}
                      </a>
                    </span>
                  ))}
                </p>
              </section>
            )}

            <p className="mt-4 text-sm">
              {brand.hasCatalogProducts ? (
                fieldBrands.has(brand.brand) ? (
                  <Link
                    href={`/sticks?brand=${encodeURIComponent(brand.brand)}`}
                    className="font-semibold text-veld hover:underline"
                  >
                    Bekijk alle {brand.brand}-sticks in onze catalogus
                  </Link>
                ) : (
                  <Link
                    href="/zaalsticks"
                    className="font-semibold text-veld hover:underline"
                  >
                    Bekijk de {brand.brand}-zaalsticks bij onze zaalsticks
                  </Link>
                )
              ) : (
                <span className="text-lijngrijs">
                  Nog geen {brand.brand}-sticks in onze catalogus (zie open
                  punten).
                </span>
              )}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-lijngrijs">
        De feiten hierboven komen van de officiële merksites, de KNHB of
        hockey.nl, met bronvermelding per claim. Heeft een merk geen officiële
        site die we konden raadplegen, dan staat dat bij het merk en noemen we
        de bron die we wel gebruikten. We nemen geen sponsoring- of spelersclaim
        over die we niet zelf konden verifiëren.
      </p>
    </div>
  );
}
