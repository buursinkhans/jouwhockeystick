import Link from 'next/link';
import type { Product } from '@/catalog/types';
import type { SimilarStick } from '@/catalog/similar';
import { ProductImage } from './ProductImage';

/**
 * Two or three alternatives with one data-based sentence each, so a visitor
 * (and a search engine) can see how the sticks in the catalog relate.
 */
export function SimilarSticks({
  current,
  similar,
}: {
  current: Product;
  similar: SimilarStick[];
}) {
  if (similar.length === 0) {
    return null;
  }

  return (
    <section className="mt-10" aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="text-xl font-bold">
        Vergelijkbare sticks
      </h2>
      <p className="mt-1 text-sm text-lijngrijs">
        Ten opzichte van de {current.name}, op basis van richtprijs en
        gepubliceerde specificaties.
      </p>
      <ul className="mt-4 space-y-3">
        {similar.map(({ product, comparison }) => (
          <li
            key={product.slug}
            className="flex items-start gap-4 rounded-2xl border border-rand bg-white p-4"
          >
            <ProductImage product={product} className="h-16 w-16 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-veld">
                {product.brand}
              </p>
              <h3 className="font-bold">
                <Link
                  href={`/sticks/${product.slug}`}
                  className="hover:underline"
                >
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-inkt/80">{comparison}</p>
              <Link
                href={`/vergelijk?a=${current.slug}&b=${product.slug}`}
                className="mt-1 inline-block text-sm font-semibold text-veld hover:underline"
              >
                Vergelijk naast elkaar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
