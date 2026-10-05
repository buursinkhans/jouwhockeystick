import type { Discipline, Product } from './types';

/** Products without a stated discipline predate the indoor section and are field sticks. */
export function getDiscipline(product: Product): Discipline {
  return product.discipline?.value ?? 'veld';
}
