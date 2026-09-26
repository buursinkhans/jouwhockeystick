import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { ProductGrid } from '@/components/catalog/ProductGrid';

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Uitgelichte sticks</h2>
        <Link href="/sticks" className="text-sm font-semibold text-emerald-800 hover:underline">
          Bekijk alle sticks
        </Link>
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
