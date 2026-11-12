import { HeroPhotos } from './HeroPhotos';
import { HomeBlockLink } from './HomeBlockLink';
import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon, InfoIcon } from '@/components/ui/icons';
import Link from 'next/link';
import { getTrustFacts } from '@/catalog/trustFacts';
import { BRAND_PAYOFF } from '@/lib/site';

const EXAMPLE_REASONS = [
  'Juiste stick',
  'Past bij het niveau',
  'Binnen budget',
];

/**
 * Photos of a youth player (see HeroPhotos) with the kind of reasons a
 * result shows. Illustrative only — no product, size or price. The reason
 * chips look like buttons and drew dead clicks (PostHog, October 2026), so
 * the whole visual leads to the stickwijzer. It repeats the main button, so
 * it is hidden from screen readers and skipped by the keyboard.
 */
function HeroVisual() {
  return (
    <HomeBlockLink
      block="hero"
      href="/stickwijzer"
      aria-hidden="true"
      tabIndex={-1}
      className="relative mx-auto block w-full max-w-sm"
    >
      <HeroPhotos />
      {/* One quiet caption under the photo (owner, 2026-11-04): on the photo it covered the stick and ball. */}
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-inkt/80">
        {EXAMPLE_REASONS.map((reason) => (
          <li key={reason} className="flex items-center gap-1.5">
            <CheckIcon size={14} className="shrink-0 text-veld" />
            {reason}
          </li>
        ))}
      </ul>
    </HomeBlockLink>
  );
}

/** Homepage hero; the pay-off sits under the header logo (owner, 2026-11-04). */
/**
 * Why the advice can be trusted, visible without scrolling. Every claim is
 * counted from the catalog or documented on /methodiek. "Winkelvergoedingen
 * tellen niet mee" (2026-11-11) holds
 * because the score has no input for fees, shop or brand; the partner links are disclosed at every shop
 * button and explained on /methodiek.
 */
function TrustLine() {
  // The catalog size is in the facts strip under the search block (2026-11-04), so not here as well.
  const items = [
    'Bron bij elk gegeven',
    'Winkelvergoedingen tellen niet mee',
  ];
  // Two fixed lines with one icon column (owner, 2026-11-12): the claims, then
  // the link that backs them, its text starting where the claims start.
  return (
    <div className="mt-5 space-y-2 text-sm">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-inkt/80">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <CheckIcon size={14} className="shrink-0 text-veld" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href="/methodiek"
        className="inline-flex min-h-6 items-center gap-1.5 font-semibold text-veld hover:underline"
      >
        <InfoIcon size={14} className="shrink-0" />
        Zo werkt ons advies →
      </Link>
    </div>
  );
}


export function Hero() {
  const { shops } = getTrustFacts();
  return (
    // Fase 7: a calm krijt-to-white field without the pattern, a larger title
    // with a short lead, and the photo as the one strong image.
    <section className="bg-gradient-to-b from-krijt to-white">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-12 md:grid-cols-[1.2fr_0.8fr] md:gap-14">
        <div>
          {/* One type scale (owner, 2026-11-12): the shared eyebrow, the title, the lead, one body grey and one link style. */}
          <p className="eyebrow">{BRAND_PAYOFF}</p>
          <h1 className="mt-4 text-[2.6rem] text-inkt sm:text-6xl">
            Vind de hockeystick die bij jou past
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-inkt/80 sm:text-xl">
            Beantwoord een paar vragen over lengte, ervaring, speelwensen en
            budget. Je krijgt de juiste maat en maximaal drie sticks, elk met
            de redenen waarom hij past en eerlijk waar je op inlevert.
          </p>
          <p className="mt-3 text-base leading-relaxed text-inkt/80">
            Per stick zie je bij welke van onze {shops} partnerwinkels hij te
            koop is, met de prijs incl. verzending.
          </p>
          <div className="mt-8 flex flex-col items-start sm:flex-row sm:items-center">
            <ButtonLink href="/stickwijzer" variant="accent" className="min-h-12 px-7 text-base">
              Start de stickwijzer
            </ButtonLink>
            {/* For parents and beginners: the same stickwijzer with only four questions (UX phase 1). */}
            <HomeBlockLink
              block="hero"
              href="/stickwijzer?snel"
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-base font-semibold text-veld hover:underline sm:mt-0 sm:ml-6"
            >
              Of kies snel advies in 2 stappen →
            </HomeBlockLink>
          </div>
          <TrustLine />
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
