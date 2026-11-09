import { MAX_PRICE_AGE_DAYS, isReadDateFresh } from './sort';

/**
 * Daily publishing, reason c (2026-11-09): rebuild when a shop price that was
 * still shown on the live build has passed the 14-day limit since, so the
 * static pages drop its amount. Safety net: rebuild when the live build is
 * older than 14 days or its date is unknown.
 */
export type ExpiryDecision = {
  build: boolean;
  /** One Dutch line for the workflow log and the publication issue. */
  reason: string;
  /** Read dates that were fresh on the build date and are not today. */
  expired: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const day = (date: Date) => Date.parse(date.toISOString().slice(0, 10));
const days = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;

export function priceExpiryDecision(readDates: readonly string[], builtIso: string | null, now: Date): ExpiryDecision {
  const built = builtIso ? new Date(builtIso) : null;
  if (!built || Number.isNaN(built.getTime())) {
    return { build: true, reason: 'builddatum live onbekend', expired: [] };
  }
  const age = Math.round((day(now) - day(built)) / DAY_MS);
  if (age > MAX_PRICE_AGE_DAYS) {
    return { build: true, reason: `live build is ${days(age)} oud`, expired: [] };
  }
  const expired = [...new Set(readDates)]
    .filter((readAt) => isReadDateFresh(readAt, built) && !isReadDateFresh(readAt, now))
    .sort();
  if (expired.length > 0) {
    return { build: true, reason: `prijzen gelezen op ${expired.join(', ')} zijn sinds de live build ouder dan ${MAX_PRICE_AGE_DAYS} dagen`, expired };
  }
  return { build: false, reason: `geen prijs verlopen sinds de live build (${days(age)} oud)`, expired: [] };
}
