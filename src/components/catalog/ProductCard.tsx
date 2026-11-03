import { productPath } from '@/catalog/paths';
import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { OfferSummary } from '@/components/offers/WhereToBuy';
import { ProductImage } from './ProductImage';
import { ProductProsAndCons } from './ProductProsAndCons';

/**
 * Fills the height of its grid cell, with the shop row pinned to the
 * bottom, so cards in one row line up regardless of text length.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex h-44 items-center justify-center rounded-2xl bg-white">
        <ProductImage product={product} className="h-40 w-40" />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wide text-veld uppercase">
        {product.brand}
      </p>
      <h3 className="mt-1 text-lg leading-snug font-bold">
        <Link href={productPath(product)} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-lijngrijs">
        {product.summary}
      </p>
      <div className="mt-4">
        <ProductProsAndCons product={product} limit={1} stacked />
      </div>
      <div className="mt-auto pt-4">
        <OfferSummary product={product} placement="catalogus" />
      </div>
    </article>
  );
}
