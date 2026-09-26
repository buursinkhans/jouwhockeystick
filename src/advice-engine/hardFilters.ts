import { isProductActive } from '@/catalog';
import type { Product } from '@/catalog/types';
import type { QuizProfile } from './types';

export function filterByLength(products: Product[], profile: QuizProfile): Product[] {
  const [min, max] = profile.lengthRangeInches;
  return products.filter((product) =>
    product.lengthsInches.value.some((length) => length >= min && length <= max),
  );
}

export function filterByAvailability(products: Product[]): Product[] {
  return products.filter((product) => product.stock.value !== 'unavailable');
}

export function filterByAbsoluteBudget(products: Product[], profile: QuizProfile): Product[] {
  return products.filter((product) => product.priceIndicativeEur.value <= profile.budgetMaxEur);
}

export function filterByVerification(products: Product[], now: Date = new Date()): Product[] {
  return products.filter((product) => isProductActive(product, now));
}

export function applyHardFilters(
  products: Product[],
  profile: QuizProfile,
  now: Date = new Date(),
): { passed: Product[]; excludedCount: number } {
  const verified = filterByVerification(products, now);
  const rightLength = filterByLength(verified, profile);
  const available = filterByAvailability(rightLength);
  const withinBudget = filterByAbsoluteBudget(available, profile);

  return {
    passed: withinBudget,
    excludedCount: products.length - withinBudget.length,
  };
}
