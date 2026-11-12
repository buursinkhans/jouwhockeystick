import { METHODE } from '@/content/methode';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The Jouwhockeystick-methode in one band on the homepage (decision log
 * 2026-11-11). The text comes from METHODE, the same source as /methodiek,
 * so the wording cannot differ between the two. It sits between the
 * stickwijzer explainer and "Waarom jouwhockeystick.nl".
 */
export function MethodBand() {
  return (
    <section
      aria-labelledby="methode-band-heading"
      className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 sm:pb-28"
    >
      <p className="eyebrow">{METHODE.home.eyebrow}</p>
      <h2
        id="methode-band-heading"
        className="mt-3 max-w-3xl text-3xl text-inkt sm:text-[2.5rem]"
      >
        {METHODE.home.heading}
      </h2>
      <p className="mt-4 lead">
        {METHODE.home.body}
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {METHODE.parts.map((part, index) => (
          <li key={part.id} className="card p-5">
            <p className="text-sm font-semibold text-veld">{index + 1}</p>
            <p className="mt-1 text-lg font-bold">{part.title}</p>
            <p className="mt-2 text-sm text-inkt/80">{part.counts.join(' · ')}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <ButtonLink href="/methodiek#methode" variant="secondary">
          {METHODE.home.cta}
        </ButtonLink>
      </div>
    </section>
  );
}
