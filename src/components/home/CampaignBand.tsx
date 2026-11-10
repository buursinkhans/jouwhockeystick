import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS, cardText } from '@/content/blackFriday';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';
import { amsterdamDate, campaignCard, campaignPhase, showCampaignNote } from '@/lib/campaign';
import { RETAILERS, type RetailerId } from '@/lib/retailers';
import { HomeBlockLink } from './HomeBlockLink';

const label = (retailer: RetailerId) => RETAILERS[retailer].label;

/**
 * The Black Friday card under the hero (decision log 2026-11-10, second
 * version): what the visitor gains and why now. It counts only Black Friday
 * actions that run or are announced, names the shop's own action name and its
 * condition, and puts the nearest end or start first. Facts from the same
 * config as /black-friday-hockey; no percentage, no countdown clock. Dark, so
 * it stands apart from the light cards around it; hidden after the campaign.
 */
export function CampaignBand({ now = new Date() }: { now?: Date }) {
  const today = amsterdamDate(now);
  if (!showCampaignNote(BLACK_FRIDAY_EDITION, today)) return null;
  const phase = campaignPhase(BLACK_FRIDAY_EDITION, today);
  const text = cardText(campaignCard(BLACK_FRIDAY_PROMOS, today, phase, label), label);
  const band = BLACK_FRIDAY.homeBand;
  const [first, ...rest] = text.lines;

  return (
    <section aria-labelledby="blackfriday-heading" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-5 rounded-3xl bg-inkt p-5 text-white sm:p-7 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.08em] text-bal uppercase">{text.eyebrow}</p>
            <h2 id="blackfriday-heading" className="mt-2 text-2xl leading-tight font-bold text-white sm:text-[1.75rem]">
              {text.heading}
            </h2>
            {first && <p className="mt-2 font-semibold text-white">{first}</p>}
            {rest.map((line) => (
              <p key={line} className="mt-1 hidden text-white/80 sm:block">
                {line}
              </p>
            ))}
            {text.checked && <p className="mt-3 text-xs text-white/70">{text.checked}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <HomeBlockLink
              block="blackfriday"
              href={BLACK_FRIDAY.path}
              className={`${buttonBaseClasses} ${buttonVariantClasses.inverse} min-h-11`}
            >
              {band.cta}
              <span aria-hidden="true">→</span>
            </HomeBlockLink>
            <p className="text-sm text-white/80">
              {band.stickwijzer.prefix}{' '}
              <HomeBlockLink block="blackfriday" href="/stickwijzer" className="font-semibold text-white underline underline-offset-2 hover:text-bal">
                {band.stickwijzer.label}
              </HomeBlockLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
