import type { Product } from '@/catalog/types';

/**
 * Compact, single-line disclosure. Still legally/CLAUDE.md-required (price
 * is indicative, partner shop is the seller) but deliberately understated
 * rather than a loud banner.
 */
export function ProductNotice({ product }: { product: Product }) {
  return (
    <p className="text-xs text-zinc-500">
      Richtprijs · verkocht via {product.partnerShop.name}
    </p>
  );
}
