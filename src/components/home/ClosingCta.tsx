import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';
import { routeStepRange } from '@/content/stickwijzer/progress';
import { HomeBlockLink } from './HomeBlockLink';

/**
 * The closing call on the homepage (fase 9): a visitor who read to the end
 * gets one clear next step instead of the footer. Same button, same copy
 * rules; the step count comes from the routes.
 */
export function ClosingCta() {
  return (
    <section aria-labelledby="slot-heading" className="border-t border-rand bg-krijt">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="slot-heading" className="text-3xl text-inkt">
            Weet in {routeStepRange()} welke stick past
          </h2>
          <p className="mt-2 max-w-xl text-inkt/80">
            Geen account en geen e-mailadres. Je krijgt de maat en maximaal drie sticks, met de redenen en wat je ervoor inlevert.
          </p>
        </div>
        <HomeBlockLink
          block="slot"
          href="/stickwijzer"
          className={`${buttonBaseClasses} ${buttonVariantClasses.accent} min-h-12 shrink-0 px-7 text-base`}
        >
          Start de stickwijzer
        </HomeBlockLink>
      </div>
    </section>
  );
}
