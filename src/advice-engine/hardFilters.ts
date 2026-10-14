import { getDiscipline } from '@/catalog';
import type { Product } from '@/catalog/types';
import {
  BAND_ORDER,
  HIGH_CARBON,
  deriveAdviceRules,
  getAdviceBlockers,
} from './productRules';
import { matchSize } from './sizeAdvice';
import type { NoMatchReason, PlayerContext } from './types';

type Stage = Exclude<NoMatchReason, 'length'>;

/**
 * Publication blockers from spec §11, plus: the stickwijzer advises field
 * sticks only. Indoor sticks have their own section without advice rules.
 */
function passesData(product: Product, ctx: PlayerContext): boolean {
  return (
    getDiscipline(product) === 'veld' &&
    getAdviceBlockers(product, ctx.now).length === 0
  );
}

/**
 * Excludes a stick that is meant for a higher level than the player (too
 * hard). A stick that is too simple stays in and loses points in the score
 * instead (owner's rule, 2026-10-14), so a no-match never happens just
 * because the player is ahead of what the catalog has in that size.
 */
export function passesExperience(
  product: Product,
  ctx: PlayerContext,
): boolean {
  const rules = deriveAdviceRules(product);
  if (BAND_ORDER.indexOf(ctx.band) < BAND_ORDER.indexOf(rules.minBand)) {
    return false;
  }
  if (ctx.route === 'START') {
    return (
      (rules.starterAllowed || rules.juniorModel) &&
      !rules.dragflickSpecialist &&
      !rules.eliteOnly &&
      product.bowProfile?.value !== 'extreme_lowbow'
    );
  }
  return true;
}

function passesSafety(product: Product, ctx: PlayerContext): boolean {
  const carbon = product.carbonPercentage?.value;
  if (ctx.firstTouchLow && carbon !== undefined && carbon >= HIGH_CARBON) {
    return false;
  }
  if (deriveAdviceRules(product).dragflickSpecialist && !ctx.hasDragflickRole) {
    return false;
  }
  return true;
}

function passesBudget(product: Product, ctx: PlayerContext): boolean {
  return (
    ctx.budget === null || product.priceIndicativeEur.value <= ctx.budget.maxEur
  );
}

function passesAvailability(product: Product, ctx: PlayerContext): boolean {
  if (ctx.answers.availability_preference === 'only_direct') {
    return product.stock.value === 'available';
  }
  return product.stock.value !== 'unavailable';
}

const NON_LENGTH_STAGES: ReadonlyArray<
  [Stage, (product: Product, ctx: PlayerContext) => boolean]
> = [
  ['experience', passesExperience],
  ['safety', passesSafety],
  ['budget', passesBudget],
  ['availability', passesAvailability],
];

/** Everything except the length check — the stick's own characteristics. */
export function passesNonLengthFilters(
  product: Product,
  ctx: PlayerContext,
): boolean {
  return (
    passesData(product, ctx) &&
    NON_LENGTH_STAGES.every(([, passes]) => passes(product, ctx))
  );
}

/**
 * Every filter except the given stages (never data or length): for the stick
 * of the brand a player wants to stay with, which is shown with a caution
 * for each relaxed stage.
 */
export function passesAllExcept(
  product: Product,
  ctx: PlayerContext,
  relaxed: ReadonlyArray<'budget' | 'experience'>,
): boolean {
  return (
    passesData(product, ctx) &&
    matchSize(product, ctx.sizeAdvice) !== 'none' &&
    NON_LENGTH_STAGES.every(
      ([stage, passes]) =>
        relaxed.some((r) => r === stage) || passes(product, ctx),
    )
  );
}

/**
 * The first filter a product fails, in the order applyHardFilters uses, or
 * null when it passes all of them.
 */
export function firstFailingStage(
  product: Product,
  ctx: PlayerContext,
): NoMatchReason | null {
  if (!passesData(product, ctx)) {
    return 'data';
  }
  for (const [stage, passes] of NON_LENGTH_STAGES) {
    if (!passes(product, ctx)) {
      return stage;
    }
  }
  return matchSize(product, ctx.sizeAdvice) === 'none' ? 'length' : null;
}

/**
 * Applies the hard filters and reports the first stage that left no
 * candidates, so the UI can explain a no-match with the actual cause.
 *
 * Owner's rule (2026-10-14): the stick is chosen on its own characteristics
 * first, and only then do we check whether it exists in the advised size.
 * So length is the last stage; a "length" no-match means sticks fit the
 * player but not in this size.
 */
export function applyHardFilters(
  products: Product[],
  ctx: PlayerContext,
): {
  passed: Product[];
  excludedCount: number;
  noMatchReason: NoMatchReason | null;
} {
  const noMatch = (noMatchReason: NoMatchReason) => ({
    passed: [],
    excludedCount: products.length,
    noMatchReason,
  });

  let candidates = products.filter((product) => passesData(product, ctx));
  if (candidates.length === 0) {
    return noMatch('data');
  }

  for (const [stage, passes] of NON_LENGTH_STAGES) {
    candidates = candidates.filter((product) => passes(product, ctx));
    if (candidates.length === 0) {
      return noMatch(stage);
    }
  }

  candidates = candidates.filter(
    (product) => matchSize(product, ctx.sizeAdvice) !== 'none',
  );
  if (candidates.length === 0) {
    return noMatch('length');
  }

  return {
    passed: candidates,
    excludedCount: products.length - candidates.length,
    noMatchReason: null,
  };
}
