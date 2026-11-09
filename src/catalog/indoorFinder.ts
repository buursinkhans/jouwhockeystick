import { getSizeAdvice, type SizeAdvice } from '@/advice-engine/sizeAdvice';

/**
 * The zaalstick finder on /zaalsticks (2026-11-09): three questions (who,
 * which length, budget) that filter the one list of indoor sticks on the
 * page. A filter, not an advice: it ranks on price only and never calls a
 * stick the best fit. Pure and small, so it runs in the browser; the items
 * are built on the server (indoorItems.ts).
 */

/** One indoor stick, as light as the browser needs it. */
export type IndoorItem = {
  slug: string;
  /** Hand-checked (rendered in the HTML) or from a shop feed (loaded on demand). */
  checked: boolean;
  /** The price on the card (cardPrice): lowest current shop total, else the indicative price. */
  priceEur: number | null;
  priceKind: 'shop' | 'indicative';
  /** Lengths in inches, from the brand or the shop. */
  lengths: readonly number[];
};

export type IndoorPlayer = 'kind' | 'volwassene';

/** From this length a stick is an adult size (the same limit as isJuniorStick). */
export const ADULT_MIN_INCH = 36.5;

/** Heights the length method covers (the stickwijzer validates the same range). */
export const MIN_HEIGHT_CM = 95;
export const MAX_HEIGHT_CM = 210;

/**
 * Budget ranges on the card price, without overlap: a stick of exactly €50
 * is in "€50 tot €100". The same limits as INDOOR_TIERS and the budget
 * article, plus a top range.
 */
export const INDOOR_BUDGETS = [
  { id: 'onder-50', label: 'Onder €50', min: 0, max: 50 },
  { id: '50-100', label: '€50 tot €100', min: 50, max: 100 },
  { id: '100-200', label: '€100 tot €200', min: 100, max: 200 },
  { id: 'vanaf-200', label: '€200 of meer', min: 200, max: Number.POSITIVE_INFINITY },
] as const;
export type IndoorBudgetId = (typeof INDOOR_BUDGETS)[number]['id'];

export type IndoorFilters = {
  player: IndoorPlayer | null;
  /**
   * The length(s) to look for: one chosen size, or the advice from a height
   * (first the advised size, then the alternative). Null = any length of the player.
   */
  sizes: readonly number[] | null;
  budget: IndoorBudgetId | null;
};

export const NO_FILTERS: IndoorFilters = { player: null, sizes: null, budget: null };

export type IndoorMatch = {
  item: IndoorItem;
  /** The length it matched on; null when no length was asked. */
  sizeInch: number | null;
  /** Only the second size of a length advice. */
  alternativeSize: boolean;
};

export function hasAnyFilter(filters: IndoorFilters): boolean {
  return filters.player !== null || filters.sizes !== null || filters.budget !== null;
}

const isAdultLength = (length: number) => length >= ADULT_MIN_INCH;
const same = (a: number, b: number) => Math.abs(a - b) < 0.01;

/** The lengths in the list for one player, ascending: the size buttons. */
export function lengthsFor(items: readonly IndoorItem[], player: IndoorPlayer): number[] {
  const all = items.flatMap((item) => item.lengths).filter((l) => isAdultLength(l) === (player === 'volwassene'));
  return [...new Set(all.map((l) => Math.round(l * 10) / 10))].sort((a, b) => a - b);
}

/** The length advice for a height without shoes; the same method as the stickwijzer. */
export function sizeAdviceFor(heightCm: number): SizeAdvice | null {
  if (!Number.isInteger(heightCm) || heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) return null;
  return getSizeAdvice(heightCm);
}

export function sizesFromAdvice(advice: SizeAdvice): number[] {
  return advice.alternativeInch === undefined ? [advice.primaryInch] : [advice.primaryInch, advice.alternativeInch];
}

/** The player a length belongs to (a height of 163 cm or more gives an adult length). */
export function playerForSize(size: number): IndoorPlayer {
  return isAdultLength(size) ? 'volwassene' : 'kind';
}

function inBudget(item: IndoorItem, budget: IndoorBudgetId | null): boolean {
  if (budget === null) return true;
  const range = INDOOR_BUDGETS.find((b) => b.id === budget);
  // No price at all: we cannot say it fits a budget, so it is left out.
  return range !== undefined && item.priceEur !== null && item.priceEur >= range.min && item.priceEur < range.max;
}

function sizeMatch(item: IndoorItem, filters: IndoorFilters): IndoorMatch | null {
  if (filters.sizes !== null) {
    const index = filters.sizes.findIndex((size) => item.lengths.some((l) => same(l, size)));
    if (index === -1) return null;
    return { item, sizeInch: filters.sizes[index] ?? null, alternativeSize: index > 0 };
  }
  if (filters.player !== null) {
    const fits = item.lengths.some((l) => isAdultLength(l) === (filters.player === 'volwassene'));
    return fits ? { item, sizeInch: null, alternativeSize: false } : null;
  }
  return { item, sizeInch: null, alternativeSize: false };
}

/** Advised size first, then by price (low to high); sticks without any price last. */
function byPrice(a: IndoorMatch, b: IndoorMatch): number {
  return (
    Number(a.alternativeSize) - Number(b.alternativeSize) ||
    (a.item.priceEur ?? Number.POSITIVE_INFINITY) - (b.item.priceEur ?? Number.POSITIVE_INFINITY) ||
    a.item.slug.localeCompare(b.item.slug)
  );
}

/** The sticks that fit every answer given so far. */
export function filterIndoor(items: readonly IndoorItem[], filters: IndoorFilters): IndoorMatch[] {
  return items
    .map((item) => sizeMatch(item, filters))
    .filter((m): m is IndoorMatch => m !== null && inBudget(m.item, filters.budget))
    .sort(byPrice);
}

/** How many sticks each budget range would give with the other answers: the counts on the buttons. */
export function countByBudget(items: readonly IndoorItem[], filters: IndoorFilters): Record<IndoorBudgetId, number> {
  const counts = {} as Record<IndoorBudgetId, number>;
  for (const range of INDOOR_BUDGETS) counts[range.id] = filterIndoor(items, { ...filters, budget: range.id }).length;
  return counts;
}

/**
 * Sticks one size shorter than the advice, when nothing exists in the advised
 * size(s): within 1.5 inch, never longer ("op de groei" is what the length
 * advice warns against). The same rule as findShorterSize in the stickwijzer.
 */
export function shorterSizeMatches(items: readonly IndoorItem[], filters: IndoorFilters): IndoorMatch[] {
  const primary = filters.sizes?.[0];
  if (primary === undefined) return [];
  return items
    .flatMap((item): IndoorMatch[] => {
      const shorter = item.lengths.filter((l) => l < primary && primary - l <= 1.5);
      return shorter.length > 0 && inBudget(item, filters.budget)
        ? [{ item, sizeInch: Math.max(...shorter), alternativeSize: false }]
        : [];
    })
    .sort(byPrice);
}
