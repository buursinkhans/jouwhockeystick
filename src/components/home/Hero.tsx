import { Logo } from '@/components/brand/Logo';
import { HeroPhotos } from './HeroPhotos';
import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/icons';
import Link from 'next/link';
import { getAllBrands, getFieldProducts } from '@/catalog';

const EXAMPLE_REASONS = [
  'Juiste stick',
  'Past bij het niveau',
  'Binnen budget',
];

/**
 * Photos of a youth player (see HeroPhotos) with the kind of reasons a
 * result shows. Illustrative only — no product, size or price.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
      <HeroPhotos />
      <ul
        aria-hidden="true"
        className="mt-3 flex flex-wrap gap-2 sm:absolute sm:top-4 sm:-left-8 sm:mt-0 sm:block sm:space-y-2 lg:-left-16"
      >
        {EXAMPLE_REASONS.map((reason) => (
          <li
            key={reason}
            className="flex items-center gap-2 rounded-full border border-rand bg-white px-3 py-1.5 text-sm font-semibold text-inkt shadow-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-veld text-white">
              <CheckIcon size={13} />
            </span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
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
  const now = new Date();
  const sticks = getFieldProducts(now, { includeImported: true }).length;
  const brands = getAllBrands(now, 'veld', { includeImported: true }).length;
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
  return (
    <section className="bg-hex-light border-b border-rand bg-krijt">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-[3fr_2fr]">
        <div>
          <div className="hidden sm:block">
            <Logo variant="wordmark" size={30} tagline href={null} />
          </div>
          <h1 className="text-4xl leading-tight font-extrabold text-inkt sm:mt-5 sm:text-5xl">
            Vind de hockeystick die bij jou past
          </h1>
          <p className="mt-4 max-w-xl text-lg text-inkt/80">
            Beantwoord een paar vragen over lengte, ervaring, speelwensen en
            budget. Je krijgt maximaal drie sticks, elk met de redenen waarom
            hij past — en eerlijk waar je op inlevert.
          </p>
          <div className="mt-6">
            <ButtonLink href="/stickwijzer" variant="accent">
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
