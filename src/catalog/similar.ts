import { getDiscipline } from './discipline';
import { BOW_LABELS } from './labels';
import type { BowProfile, ExperienceLevel, Product } from './types';

/** Shortest adult length in the catalog; anything shorter is a junior size. */
const ADULT_MIN_LENGTH_INCH = 36.5;

const LEVEL_AUDIENCE: Record<ExperienceLevel, string> = {
  beginner: 'beginnende spelers',
  gevorderd: 'gevorderde spelers',
  ervaren: 'ervaren spelers',
};

/** Below this price difference two sticks count as similarly priced. */
const SIMILAR_PRICE_EUR = 10;

const LEVEL_ORDER: Record<ExperienceLevel, number> = {
  beginner: 0,
  gevorderd: 1,
  ervaren: 2,
};

export function isJuniorStick(product: Product): boolean {
  return product.lengthsInches.value.every(
    (length) => length < ADULT_MIN_LENGTH_INCH,
  );
}

export type SimilarStick = {
  product: Product;
  /** One factual sentence on how this stick differs from the one on the page. */
  comparison: string;
};

function sharesLength(a: Product, b: Product): boolean {
  return a.lengthsInches.value.some((length) =>
    b.lengthsInches.value.includes(length),
  );
}

function similarityScore(current: Product, candidate: Product): number {
  const levelGap = Math.abs(
    LEVEL_ORDER[current.experienceLevel.value] -
      LEVEL_ORDER[candidate.experienceLevel.value],
  );
  const priceA = current.priceIndicativeEur.value;
  const priceB = candidate.priceIndicativeEur.value;
  const relativePriceGap = Math.abs(priceA - priceB) / Math.max(priceA, priceB);

  let score = 0;
  score += levelGap === 0 ? 3 : levelGap === 1 ? 1 : 0;
  score += 3 * Math.max(0, 1 - relativePriceGap * 2);
  if (sharesLength(current, candidate)) score += 2;
  if (
    current.bowProfile &&
    candidate.bowProfile?.value === current.bowProfile.value
  ) {
    score += 1;
  }
  return score;
}

function joinDutch(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} en ${parts.at(-1)}`;
}

/** Bow label without the "/ standaard" suffix, for use mid-sentence. */
function bowName(bow: BowProfile): string {
  return BOW_LABELS[bow].split(' / ')[0]?.toLowerCase() ?? bow;
}

/**
 * Describes the candidate relative to the current stick using only catalog
 * data: indicative price, carbon, bow profile and intended level. A spec that
 * is missing on either stick is left out rather than guessed.
 */
export function describeDifference(
  current: Product,
  candidate: Product,
): string {
  const parts: string[] = [];

  const priceDiff =
    candidate.priceIndicativeEur.value - current.priceIndicativeEur.value;
  parts.push(
    Math.abs(priceDiff) < SIMILAR_PRICE_EUR
      ? 'vergelijkbare richtprijs'
      : `€${Math.round(Math.abs(priceDiff))} ${priceDiff < 0 ? 'lagere' : 'hogere'} richtprijs`,
  );

  const carbonA = current.carbonPercentage?.value;
  const carbonB = candidate.carbonPercentage?.value;
  if (carbonA !== undefined && carbonB !== undefined && carbonA !== carbonB) {
    parts.push(
      `${carbonB > carbonA ? 'meer' : 'minder'} carbon (${carbonB}% tegen ${carbonA}%)`,
    );
  }

  const bowA = current.bowProfile?.value;
  const bowB = candidate.bowProfile?.value;
  if (bowA && bowB) {
    parts.push(
      bowA === bowB
        ? `ook een ${bowName(bowB)}`
        : `${bowName(bowB)} in plaats van ${bowName(bowA)}`,
    );
  }

  const levelA = current.experienceLevel.value;
  const levelB = candidate.experienceLevel.value;
  if (levelA !== levelB) {
    parts.push(`bedoeld voor ${LEVEL_AUDIENCE[levelB]}`);
  }

  if (!sharesLength(current, candidate)) {
    const lengths = candidate.lengthsInches.value.map((l) => `${l}"`);
    parts.push(`alleen in ${joinDutch(lengths)}`);
  }

  const sentence = joinDutch(parts);
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

/**
 * Up to `limit` sticks a visitor could weigh against this one: same
 * discipline, same size group (junior or adult), not unavailable, ranked on
 * intended level, price, shared lengths and bow profile.
 */
export function getSimilarSticks(
  current: Product,
  products: Product[],
  limit = 3,
): SimilarStick[] {
  const junior = isJuniorStick(current);
  return products
    .filter(
      (candidate) =>
        candidate.slug !== current.slug &&
        candidate.stock.value !== 'unavailable' &&
        getDiscipline(candidate) === getDiscipline(current) &&
        isJuniorStick(candidate) === junior,
    )
    .map((candidate) => ({
      candidate,
      score: similarityScore(current, candidate),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.candidate.slug.localeCompare(b.candidate.slug),
    )
    .slice(0, limit)
    .map(({ candidate }) => ({
      product: candidate,
      comparison: describeDifference(current, candidate),
    }));
}
