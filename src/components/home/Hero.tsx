import { Logo, LogoIcon } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/icons';
import { SCREENS } from '@/content/stickwijzer/questions';

const stepCounts = Object.values(SCREENS).map((screens) => screens.length);
const minSteps = Math.min(...stepCounts);
const maxSteps = Math.max(...stepCounts);

const EXAMPLE_REASONS = [
  'Juiste stick',
  'Past bij het niveau',
  'Binnen budget',
];

/**
 * The large brand icon (merkinstructie §3.2: arc and grip lines from 128 px)
 * with the kind of reasons a result shows. Illustrative only — no product,
 * size or price.
 */
function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex w-full max-w-xs justify-center py-4 [&>svg]:h-56 [&>svg]:w-56 sm:[&>svg]:h-64 sm:[&>svg]:w-64"
    >
      <LogoIcon size={256} />
      <ul className="absolute top-8 -left-2 space-y-2 sm:-left-10">
        {EXAMPLE_REASONS.map((reason) => (
          <li
            key={reason}
            className="flex items-center gap-2 rounded-full border border-rand bg-white px-3 py-1.5 text-sm font-semibold text-inkt"
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
export function Hero() {
  return (
    <section className="bg-hex-light border-b border-rand bg-krijt">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[3fr_2fr]">
        <div>
          <Logo variant="wordmark" size={40} tagline href={null} />
          <h1 className="mt-8 text-4xl leading-tight font-extrabold text-inkt sm:text-5xl">
            Vind de hockeystick die bij jou past
          </h1>
          <p className="mt-5 max-w-xl text-lg text-inkt/80">
            Beantwoord een paar vragen over lengte, ervaring, speelwensen en
            budget. Je krijgt maximaal drie sticks, elk met de redenen waarom
            hij past — en eerlijk waar je op inlevert.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/stickwijzer" variant="accent">
              Start de stickwijzer
            </ButtonLink>
            <span className="text-sm text-lijngrijs">
              Geen account nodig · {minSteps} tot {maxSteps} korte stappen
            </span>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
