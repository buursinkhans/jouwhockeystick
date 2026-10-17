import type { Product } from './types';

/**
 * Whether we link to bol.com for this stick. Not when bol.com does not sell
 * it (bolNotSold), and not for a feed-imported stick without a bol.com page:
 * we have not checked bol.com for those, and a search link could land on an
 * unrelated product.
 */
export function isSoldAtBol(product: Product): boolean {
  if (product.bolNotSold !== undefined) return false;
  if (product.feedImport !== undefined && product.bolProductUrl === undefined) return false;
  return true;
}

/**
 * The only shop button is PassaHockey (TradeTracker partner link): bol.com
 * does not sell the stick, or we have not checked bol.com for it.
 */
export function isPassaSportsOnly(product: Product): boolean {
  return !isSoldAtBol(product) && product.passaSportsProductUrl !== undefined;
}

/** A feed-imported stick for which nobody has checked bol.com yet. */
export function isBolUnchecked(product: Product): boolean {
  return (
    product.feedImport !== undefined &&
    product.bolProductUrl === undefined &&
    product.bolNotSold === undefined
  );
}
