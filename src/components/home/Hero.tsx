import { Logo } from '@/components/brand/Logo';
import { HeroPhotos } from './HeroPhotos';
import { HomeBlockLink } from './HomeBlockLink';
import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/icons';
import Link from 'next/link';
import { getCatalogStats } from '@/catalog/stats';
import { getTrustFacts } from '@/catalog/trustFacts';

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
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.8125rem] font-semibold text-inkt">
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

/** Homepage hero: primary wordmark with pay-off on a light background (merkinstructie §4). */
/**
 * Why the advice can be trusted, visible without scrolling. Every claim is
 * counted from the catalog or documented on /methodiek. "Onafhankelijk
 * advies" (owner's wording, 2026-10-19) holds because the score has no input
 * for fees, shop or brand; the partner links are disclosed at every shop
 * button and explained on /methodiek.
 */
function TrustLine() {
  const stats = getCatalogStats();
  const sticks = stats.fieldSticks;
  const brands = stats.fieldBrands.length;
  const items = [
    `${sticks} veldsticks van ${brands} merken`,
    'Bron bij elk gegeven',
    'Onafhankelijk advies',
  ];
  return (
    <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-inkt/80">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <CheckIcon size={14} className="shrink-0 text-veld" />
          {item}
        </li>
      ))}
      <li>
        <Link
          href="/methodiek"
          className="font-semibold text-veld hover:underline"
        >
          Zo werkt ons advies →
        </Link>
      </li>
    </ul>
  );
}


export function Hero() {
  const { shops } = getTrustFacts();
  return (
    // Fase 7: a calm krijt-to-white field without the pattern, a larger title
    // with a short lead, and the photo as the one strong image.
    <section className="border-b border-rand/70 bg-gradient-to-b from-krijt to-white">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-12 md:grid-cols-[1.2fr_0.8fr] md:gap-14">
        <div>
          <div className="hidden sm:block">
            <Logo variant="wordmark" size={26} tagline href={null} />
          </div>
          <h1 className="text-[2.6rem] text-inkt sm:mt-8 sm:text-6xl">
            Vind de hockeystick die bij jou past
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-inkt/80 sm:text-xl">
            Beantwoord een paar vragen over lengte, ervaring, speelwensen en
            budget. Je krijgt de juiste maat en maximaal drie sticks, elk met
            de redenen waarom hij past en eerlijk waar je op inlevert.
          </p>
          <p className="mt-3 max-w-xl text-inkt/70">
            Per stick zie je bij welke van onze {shops} partnerwinkels hij te
            koop is, met de prijs incl. verzending.
          </p>
          <div className="mt-8">
            <ButtonLink href="/stickwijzer" variant="accent" className="min-h-12 px-7 text-base">
              Start de stickwijzer
            </ButtonLink>
          </div>
          <TrustLine />
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
