import type { Product } from './types';

/** The model year a product's specs were verified for, if any sourced field states one. */
export function getModelYear(product: Product): number | undefined {
  return (
    product.experienceLevel.modelYear ??
    product.bowProfile?.modelYear ??
    product.lengthsInches.modelYear ??
    product.priceIndicativeEur.modelYear
  );
}
