import { PASSAHOCKEY_IMPORT_DATE } from './imported/passahockey';
import { PASSAHOCKEY_LIVE_PRICES } from './imported/passaPrices';
import { PLUTOSPORT_IMPORT_DATE } from './imported/plutosport';
import { BOL_PRICES } from './offers/bolPrices';
import { PLUTOSPORT_MATCHES } from './offers/matches';

/** First and last day on which the shop feeds behind the offer and prices were read. */
export type FeedReadDates = { from: string; to: string };

/**
 * The dates the weekly sync writes into its generated files: the PassaHockey
 * and Plutosport imports (the sticks from the feeds), the PassaHockey prices of
 * the curated sticks, the bol.com prices and the Plutosport matches. Each
 * script writes its date only after a successful read, so these are the real
 * read dates, not the build or deploy date.
 */
export const FEED_READ_DATES: readonly string[] = [
  PASSAHOCKEY_IMPORT_DATE,
  PASSAHOCKEY_LIVE_PRICES.date,
  PLUTOSPORT_IMPORT_DATE,
  PLUTOSPORT_MATCHES.date,
  BOL_PRICES.date,
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The range of read dates, or null when any date is missing or malformed:
 * then the page shows no offer date at all rather than a guess (decision log
 * 2026-10-29). Never falls back to today.
 */
export function getFeedReadDates(
  dates: readonly string[] = FEED_READ_DATES,
): FeedReadDates | null {
  if (
    dates.length === 0 ||
    !dates.every((d) => ISO_DATE.test(d) && !Number.isNaN(Date.parse(d)))
  ) {
    return null;
  }
  const sorted = [...dates].sort();
  return { from: sorted[0]!, to: sorted[sorted.length - 1]! };
}
