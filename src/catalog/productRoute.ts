import { getProductBySlug } from './index';
import { productPath, productSection, type ProductSection } from './paths';
import type { Product } from './types';

export type ProductRoute =
  | { kind: 'page'; product: Product }
  | { kind: 'redirect'; to: string }
  | { kind: 'not-found' };

/**
 * What a product URL should do: show the page, send a stick that changed
 * place (imported ↔ kept by hand) to its own path, or 404 for an unknown slug.
 */
export function resolveProductRoute(
  slug: string,
  section: ProductSection,
): ProductRoute {
  const product = getProductBySlug(slug);
  if (!product) return { kind: 'not-found' };
  return productSection(product) === section
    ? { kind: 'page', product }
    : { kind: 'redirect', to: productPath(product) };
}
