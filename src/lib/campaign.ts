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
 * percentage or a former price (CLAUDE.md, Commerce): the type of action, the
 * shop's own name for it, who can use it, its dates when the shop states them,
 * and where we read it.
 */
export type ShopPromo = {
  retailer: RetailerId;
  /** 'geen' = we checked and found no action; 'sale' = a regular sale, not a Black Friday action. */
  kind: 'black-friday' | 'sale' | 'geen';
  /** The shop's own name for the action, as on its page (e.g. "Black Friday Early Access"); null when it gives none. */
  name: string | null;
  /** Who can use it, short, as the shop states it (e.g. "met een code via de nieuwsbrief"); null when open to all or not stated. */
  audience: string | null;
  /** 'niet-gecontroleerd' = we could not read the shop's page; nothing is claimed. */
  status: 'gecontroleerd' | 'niet-gecontroleerd';
  /** What the action is on, as the shop states it; empty when it does not say. */
  categories: readonly ('hockeysticks' | 'hockeyschoenen' | 'hockey' | 'alles')[];
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

/**
 * When an action starts or stops, relative to today (Europe/Amsterdam), for
 * the "stopt over 5 dagen" and "begint 20 nov" lines on the homepage card and
 * the campaign page. Days are whole calendar days.
 */
export type PromoTiming =
  | { kind: 'laatste-dag'; endsAt: string }
  | { kind: 'stopt'; days: number; endsAt: string }
  | { kind: 'loopt' }
  | { kind: 'begint'; days: number; startsAt: string }
  | { kind: 'aangekondigd' }
  | { kind: 'afgelopen' }
  | { kind: 'geen' }
  | { kind: 'onbekend' };

export function promoTiming(promo: ShopPromo, today: string, phase: CampaignPhase): PromoTiming {
  const state = promoState(promo, today, phase);
  if (state === 'actueel') {
    if (!promo.endsAt) return { kind: 'loopt' };
    const days = daysBetween(today, promo.endsAt);
    return days === 0 ? { kind: 'laatste-dag', endsAt: promo.endsAt } : { kind: 'stopt', days, endsAt: promo.endsAt };
  }
  if (state === 'binnenkort') {
    return promo.startsAt ? { kind: 'begint', days: daysBetween(today, promo.startsAt), startsAt: promo.startsAt } : { kind: 'aangekondigd' };
  }
  return { kind: state };
}

/** A Black Friday action that runs or is announced; a regular sale or "no action" never counts. */
export const isBlackFridayAction = (promo: ShopPromo, state: PromoState) =>
  promo.kind === 'black-friday' && (state === 'actueel' || state === 'binnenkort');

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

/** Within this many days an end date counts as urgent on the homepage card. */
export const URGENT_DAYS = 7;

export type CampaignCard = {
  /** Black Friday actions running now. */
  running: number;
  /** Black Friday actions announced, not started. */
  announced: number;
  /** Shops with a running or announced Black Friday action, as shown: running first, then by name. */
  shops: RetailerId[];
  /** The urgent lines, most urgent first: an end within URGENT_DAYS (soonest first), then starts (soonest first). */
  urgent: { promo: ShopPromo; timing: Extract<PromoTiming, { kind: 'laatste-dag' | 'stopt' | 'begint' }> }[];
  /** Latest check within 14 days, else null. */
  lastCheck: string | null;
};

/**
 * What the homepage card says (decision log 2026-11-10, second version): only
 * Black Friday actions that run or are announced, from the same config as the
 * campaign page. An ended action never appears.
 */
export function campaignCard(
  promos: readonly ShopPromo[],
  today: string,
  phase: CampaignPhase,
  label: (retailer: RetailerId) => string,
): CampaignCard {
  const rows = sortShopPromos(promos, today, phase, label).filter(({ promo, state }) => isBlackFridayAction(promo, state));
  const ending: CampaignCard['urgent'] = [];
  const starting: CampaignCard['urgent'] = [];
  for (const { promo } of rows) {
    const timing = promoTiming(promo, today, phase);
    if (timing.kind === 'laatste-dag' || (timing.kind === 'stopt' && timing.days <= URGENT_DAYS)) ending.push({ promo, timing });
    if (timing.kind === 'begint') starting.push({ promo, timing });
  }
  const at = (u: CampaignCard['urgent'][number]) => ('endsAt' in u.timing ? u.timing.endsAt : u.timing.startsAt);
  const fresh = rows
    .map(({ promo }) => promo.verifiedAt)
    .filter((d): d is string => d !== null && daysBetween(d, today) <= MAX_PROMO_CHECK_AGE_DAYS);
  return {
    running: rows.filter((r) => r.state === 'actueel').length,
    announced: rows.filter((r) => r.state === 'binnenkort').length,
    shops: rows.map((r) => r.promo.retailer),
    urgent: [...ending.sort((a, b) => at(a).localeCompare(at(b))), ...starting.sort((a, b) => at(a).localeCompare(at(b)))],
    lastCheck: fresh.length ? fresh.reduce((a, b) => (b > a ? b : a)) : null,
  };
}
