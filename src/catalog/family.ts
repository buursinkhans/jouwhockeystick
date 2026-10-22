import { getDiscipline } from './discipline';
import { graysFamily } from './feedImport';
import { isJuniorStick } from './similar';
import type { Product } from './types';

export type ProductFamily = {
  brand: string;
  /** The brand's own name for the curve family, e.g. "Jumbow". */
  family: string;
  /** Lowest carbon first, then lowest price: the order of the range. */
  members: Product[];
};

/** Family name for a curated stick. Only Grays names its families in the model name. */
function familyOf(product: Product): string | null {
  return product.brand === 'Grays'
    ? (graysFamily(product.name)?.family ?? null)
    : null;
}

/**
 * The other models of the same brand family (e.g. Grays JB 6, 8, 10 and 12+),
 * same discipline and size group, so a visitor sees how the range steps up.
 * Curated sticks only: their specs are checked by hand. Null when the stick
 * has no family or fewer than three models are in it.
 */
export function getProductFamily(
  current: Product,
  products: Product[],
): ProductFamily | null {
  const family = familyOf(current);
  if (!family) return null;
  const junior = isJuniorStick(current);
  const discipline = getDiscipline(current);
  const members = products
    .filter(
      (p) =>
        p.brand === current.brand &&
        !p.feedImport &&
        familyOf(p) === family &&
        getDiscipline(p) === discipline &&
        isJuniorStick(p) === junior,
    )
    .sort(
      (a, b) =>
        (a.carbonPercentage?.value ?? -1) - (b.carbonPercentage?.value ?? -1) ||
        a.priceIndicativeEur.value - b.priceIndicativeEur.value,
    );
  return members.length >= 3 ? { brand: current.brand, family, members } : null;
}
