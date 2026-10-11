import { SEASON_BAND } from '@/content/home';
import {
  buttonBaseClasses,
  buttonVariantClasses,
} from '@/components/ui/Button';
import { HomeBlockLink } from './HomeBlockLink';

/**
 * Variant A: a slim seasonal band under the hero for visitors looking for an
 * indoor stick, which the (field-only) stickwijzer cannot advise. Blue, not
 * orange: orange stays reserved for the stickwijzer.
 */
export function SeasonBand() {
  const { eyebrow, heading, body, cta, readMore } = SEASON_BAND;
  return (
    <section
      aria-labelledby="seizoen-heading"
      className="border-b border-rand bg-white"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-veld">
            {eyebrow}
          </p>
          <h2 id="seizoen-heading" className="mt-1 text-xl font-bold">
            {heading}
          </h2>
          <p className="mt-1 text-inkt/80">{body}</p>
          <p className="mt-2 text-sm text-lijngrijs">
            {readMore.prefix}{' '}
            <HomeBlockLink
              block="season"
              href={readMore.href}
              className="font-semibold text-veld underline underline-offset-2 hover:text-inkt"
            >
              {readMore.label}
            </HomeBlockLink>
          </p>
        </div>
        <HomeBlockLink
          block="season"
          href={cta.href}
          className={`${buttonBaseClasses} ${buttonVariantClasses.primary} min-h-11 shrink-0 self-start md:self-center`}
        >
          {cta.label}
        </HomeBlockLink>
      </div>
    </section>
  );
}
