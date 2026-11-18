import { SEASON_BAND } from '@/content/home';
import {
  buttonBaseClasses,
  buttonVariantClasses,
} from '@/components/ui/Button';
import { HomeBlockLink } from './HomeBlockLink';

/**
 * The compact indoor block under the hero, for visitors looking for an indoor
 * stick, which the (field-only) stickwijzer cannot advise. Blue, not orange:
 * orange stays reserved for the stickwijzer. Both links are in the first HTML
 * and report `home_block_click` with block "season". On a phone the button
 * spans the width, so it is the first thing to tap; from tablet width it sits
 * to the right of the text.
 */
export function SeasonBand() {
  const { heading, body, cta, readMore } = SEASON_BAND;
  return (
    <section aria-labelledby="seizoen-heading" className="bg-white">
      <div className="mx-auto grid max-w-5xl gap-x-8 gap-y-3 px-4 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl">
          <h2 id="seizoen-heading" className="text-xl font-bold">
            {heading}
          </h2>
          <p className="mt-1 text-inkt/80">{body}</p>
        </div>
        <HomeBlockLink
          block="season"
          href={cta.href}
          className={`${buttonBaseClasses} ${buttonVariantClasses.primary} min-h-12 w-full justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto`}
        >
          {cta.label}
        </HomeBlockLink>
        <p className="text-sm">
          <HomeBlockLink
            block="season"
            href={readMore.href}
            className="inline-flex min-h-11 items-center font-semibold text-veld underline underline-offset-2 hover:text-inkt"
          >
            {readMore.label}
          </HomeBlockLink>
        </p>
      </div>
    </section>
  );
}
