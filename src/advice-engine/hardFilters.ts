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

/** Publication blockers from spec §11: missing bow, source, model year, stock or verification. */
function passesData(product: Product, ctx: PlayerContext): boolean {
  return getAdviceBlockers(product, ctx.now).length === 0;
}

function passesExperience(product: Product, ctx: PlayerContext): boolean {
  const rules = deriveAdviceRules(product);
  const player = BAND_ORDER.indexOf(ctx.band);
  if (
    player < BAND_ORDER.indexOf(rules.minBand) ||
    player > BAND_ORDER.indexOf(rules.maxBand)
  ) {
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

/** Everything except the length check — used for the shorter-size fallback. */
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
 * Applies the hard filters in the spec's decision order (§2.2) and reports
 * the first stage that left no candidates, so the UI can explain a no-match
 * with the actual cause instead of a generic message.
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

  candidates = candidates.filter(
    (product) => matchSize(product, ctx.sizeAdvice) !== 'none',
  );
  if (candidates.length === 0) {
    return noMatch('length');
  }

  for (const [stage, passes] of NON_LENGTH_STAGES) {
    candidates = candidates.filter((product) => passes(product, ctx));
    if (candidates.length === 0) {
      return noMatch(stage);
    }
  }

  return {
    passed: candidates,
    excludedCount: products.length - candidates.length,
    noMatchReason: null,
  };
}
