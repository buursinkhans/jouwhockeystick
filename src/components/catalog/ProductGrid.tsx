import type { Product } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  products,
  placement,
  showLengths,
}: {
  products: Product[];
  placement?: RetailerPlacement;
  showLengths?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="text-lijngrijs">
        Er zijn op dit moment geen actieve producten.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.slug} className="h-full" data-slug={product.slug}>
          <ProductCard product={product} placement={placement} showLengths={showLengths} />
        </li>
      ))}
    </ul>
  );
}
