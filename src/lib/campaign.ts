import type { RetailerId } from './retailers';

/**
 * Dates and states of a yearly shop campaign (Black Friday, decision log
 * 2026-11-10). Pure functions on YYYY-MM-DD strings in Europe/Amsterdam, so
 * they can be tested and give the same answer on the server and in a build.
 */

/** Today's date in Europe/Amsterdam as YYYY-MM-DD. */
export function amsterdamDate(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const DAY_MS = 86_400_000;
const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
/** Whole days from a to b (both YYYY-MM-DD). */
export const daysBetween = (a: string, b: string) => dayNumber(b) - dayNumber(a);

export type CampaignEdition = {
  year: number;
  /** Black Friday itself. */
  day: string;
  /** Last day of the campaign weekend (Cyber Monday). */
  lastDay: string;
  /** From this day the other pages link to the campaign page. */
  announceFrom: string;
};

export type CampaignPhase = 'voor' | 'actief' | 'afgelopen';

export function campaignPhase(edition: CampaignEdition, today: string): CampaignPhase {
  if (today > edition.lastDay) return 'afgelopen';
  if (today >= edition.day) return 'actief';
  return 'voor';
}

/** Whether /sticks, /zaalsticks and /hockeyschoenen show the short link to the campaign page. */
export const showCampaignNote = (edition: CampaignEdition, today: string) =>
  today >= edition.announceFrom && today <= edition.lastDay;

/**
 * One shop's action as we checked it on the shop's own pages. Never a
 * percentage or a former price (CLAUDE.md, Commerce): the type of action,
 * its dates when the shop states them, and where we read it.
 */
export type ShopPromo = {
  retailer: RetailerId;
  /** 'geen' = we checked and found no action. */
  kind: 'black-friday' | 'sale' | 'nieuwsbrief' | 'geen';
  /** 'niet-gecontroleerd' = we could not read the shop's page; nothing is claimed. */
  status: 'gecontroleerd' | 'niet-gecontroleerd';
  /** Product groups the shop names for the action; empty when it names none. */
  categories: readonly ('hockeysticks' | 'hockeyschoenen' | 'hockey' | 'algemeen')[];
  /** YYYY-MM-DD as the shop states it, else null. */
  startsAt: string | null;
  endsAt: string | null;
  /** YYYY-MM-DD of our last check, null when never checked. */
  verifiedAt: string | null;
  /** What the shop says, in our words; one or two sentences, no percentages. */
  summary: string;
  /** Conditions the shop states, or null. */
  conditions: string | null;
  /** The page we checked. */
  sourceUrl: string;
  /** Where the button goes (a page on the shop's own domain; tracked in shopPageTrackingUrl). */
  url: string;
};

/** A check older than this no longer counts as current (as for prices, CLAUDE.md). */
export const MAX_PROMO_CHECK_AGE_DAYS = 14;

export type PromoState = 'actueel' | 'binnenkort' | 'afgelopen' | 'geen' | 'onbekend';

export function promoState(promo: ShopPromo, today: string, phase: CampaignPhase): PromoState {
  if (promo.status === 'niet-gecontroleerd' || !promo.verifiedAt) return 'onbekend';
  if (promo.endsAt && today > promo.endsAt) return 'afgelopen';
  // After the campaign an action without an end date is not shown as running.
  if (phase === 'afgelopen' && !promo.endsAt) return 'afgelopen';
  if (daysBetween(promo.verifiedAt, today) > MAX_PROMO_CHECK_AGE_DAYS) return 'onbekend';
  if (promo.kind === 'geen') return 'geen';
  if (promo.startsAt && today < promo.startsAt) return 'binnenkort';
  return 'actueel';
}

const STATE_ORDER: Record<PromoState, number> = { actueel: 0, binnenkort: 1, geen: 2, onbekend: 3, afgelopen: 4 };

/**
 * The shop rows in the order shown: running actions first, then announced,
 * checked without action, not checked and ended; within a state by shop
 * name. Never by commission or network.
 */
export function sortShopPromos<T extends ShopPromo>(
  promos: readonly T[],
  today: string,
  phase: CampaignPhase,
  label: (retailer: RetailerId) => string,
): { promo: T; state: PromoState }[] {
  return promos
    .map((promo) => ({ promo, state: promoState(promo, today, phase) }))
    .sort(
      (a, b) =>
        STATE_ORDER[a.state] - STATE_ORDER[b.state] ||
        label(a.promo.retailer).localeCompare(label(b.promo.retailer), 'nl'),
    );
}
