import type { Product } from './types';

/**
 * bol.com does not sell this stick, but PassaSports does. Temporary state
 * until the PassaSports affiliate link exists: the stick is advised like any
 * other, but has no shop button yet.
 */
export function isPassaSportsOnly(product: Product): boolean {
  return (
    product.bolNotSold !== undefined &&
    product.passaSportsProductUrl !== undefined
  );
}
