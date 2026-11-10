import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS, formatNlDate } from '@/content/blackFriday';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';
import { amsterdamDate, campaignHighlights, campaignPhase, showCampaignNote } from '@/lib/campaign';
import { RETAILERS } from '@/lib/retailers';
import { HomeBlockLink } from './HomeBlockLink';

/**
 * The Black Friday band under the hero (decision log 2026-11-10), in the place
 * and style of SeasonBand, which it replaces while it shows. Facts only:
 * how many partner shops have an action, the dates the shops confirm and when
 * we checked. No percentage, no countdown; blue, as orange stays the stickwijzer's.
 */
export function CampaignBand({ now = new Date() }: { now?: Date }) {
  const today = amsterdamDate(now);
  if (!showCampaignNote(BLACK_FRIDAY_EDITION, today)) return null;
  const phase = campaignPhase(BLACK_FRIDAY_EDITION, today);
  const h = campaignHighlights(BLACK_FRIDAY_PROMOS, today, phase, (r) => RETAILERS[r].label);
  const band = BLACK_FRIDAY.homeBand;

  let body: string = band.fallback;
  if (h.lastCheck && h.withAction > 0) {
    const count = `${h.withAction} van de ${h.total} partnerwinkels ${h.withAction === 1 ? 'heeft' : 'hebben'} een actie.`;
    body = h.facts.length ? `${count} ${h.facts.join(', ')}.` : count;
  }

  return (
    <section aria-labelledby="blackfriday-heading" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-rand bg-mist/60 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-veld uppercase">{band.eyebrow}</p>
            <h2 id="blackfriday-heading" className="mt-1 text-xl font-bold">
              {band.heading[phase === 'actief' ? 'actief' : 'voor']}
            </h2>
            <p className="mt-1 text-inkt/80">{body}</p>
            {h.lastCheck && (
              <p className="mt-2 text-sm text-lijngrijs">
                Nagekeken op <time dateTime={h.lastCheck}>{formatNlDate(h.lastCheck)}</time>, op de sites van de winkels
              </p>
            )}
          </div>
          <HomeBlockLink
            block="blackfriday"
            href={BLACK_FRIDAY.path}
            className={`${buttonBaseClasses} ${buttonVariantClasses.primary} min-h-11 shrink-0 self-start md:self-center`}
          >
            {band.cta}
            <span aria-hidden="true">→</span>
          </HomeBlockLink>
        </div>
      </div>
    </section>
  );
}
