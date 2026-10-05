import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { ProductGrid } from '@/components/catalog/ProductGrid';

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="border-t border-rand bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-veld uppercase">
              Uit de catalogus
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Uitgelichte sticks
            </h2>
          </div>
          <Link
            href="/sticks"
            className="font-semibold text-veld hover:underline"
          >
            Bekijk alle sticks →
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
