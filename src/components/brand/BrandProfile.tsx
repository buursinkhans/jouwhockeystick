import type { BrandProfile as Profile } from '@/content/brands';

const DUTCH_DATE = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const formatDate = (isoDate: string) => DUTCH_DATE.format(new Date(`${isoDate}T00:00:00Z`));

/**
 * What the repo knows about the brand, with its sources (src/content/brands.ts):
 * the same text as on /merken, nothing added. A part the brand profile does not
 * have (a philosophy, a quote, a national team note) is left out.
 */
export function BrandProfile({ profile }: { profile: Profile }) {
  return (
    <section aria-labelledby="profiel-kop" className="mt-12 max-w-3xl">
      <h2 id="profiel-kop" className="text-2xl font-bold">
        Over {profile.brand}
      </h2>
      <p className="mt-3 text-inkt/80">
        {profile.characteristics}{' '}
        <a href={profile.characteristicsSourceUrl} className="inline-flex min-h-6 items-center text-veld hover:underline">
          (bron)
        </a>
      </p>

      {profile.nationalTeamNote && (
        <p className="mt-3 text-inkt/80">
          <strong>Nederlands hockeyteam: </strong>
          {profile.nationalTeamNote}{' '}
          {profile.nationalTeamSourceUrl && (
            <a href={profile.nationalTeamSourceUrl} className="inline-flex min-h-6 items-center text-veld hover:underline">
              (bron)
            </a>
          )}
        </p>
      )}

      {profile.quotes && profile.quotes.length > 0 && (
        <div className="mt-3 space-y-3">
          {profile.quotes.map((q) => (
            <blockquote key={q.sourceUrl} className="border-l-2 border-veld pl-3 text-sm italic text-inkt/80">
              &ldquo;{q.quote}&rdquo;
              <footer className="mt-1 text-xs not-italic text-lijngrijs">
                — {q.attribution}
                {q.language ? ` · ${q.language}` : ''} ·{' '}
                <a href={q.sourceUrl} className="inline-flex min-h-6 items-center hover:underline">
                  bron
                </a>
              </footer>
            </blockquote>
          ))}
        </div>
      )}

      {profile.philosophy && (
        <div className="mt-5 border-t border-rand pt-4">
          <h3 className="text-lg font-bold">Hoe denkt {profile.brand} over sticks?</h3>
          {profile.philosophy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-2 text-inkt/80">
              {paragraph}
            </p>
          ))}
          <p className="mt-2 text-xs text-lijngrijs">
            Zo beschrijft {profile.brand} het zelf op de eigen website (gecontroleerd op {formatDate(profile.philosophy.checkedAt)}):{' '}
            {profile.philosophy.sources.map((source, index) => (
              <span key={source.url}>
                {index > 0 && ' · '}
                <a href={source.url} className="inline-flex min-h-6 items-center hover:underline">
                  {source.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      )}
    </section>
  );
}
