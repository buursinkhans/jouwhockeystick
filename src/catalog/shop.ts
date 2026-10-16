import type { Product } from './types';

/**
 * bol.com does not sell this stick, but PassaSports does: the shop button
 * is a PassaSports partner link (TradeTracker) instead of bol.com.
 */
export function isPassaSportsOnly(product: Product): boolean {
  return (
    product.bolNotSold !== undefined &&
    product.passaSportsProductUrl !== undefined
  );
}
