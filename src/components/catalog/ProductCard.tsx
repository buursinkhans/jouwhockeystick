import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { Card } from '@/components/ui/Card';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { RetailerLinks } from '@/components/ui/RetailerLinks';
import { ProductImage } from './ProductImage';
import { ProductProsAndCons } from './ProductProsAndCons';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <ProductImage product={product} className="h-24 w-24" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {product.brand}
      </p>
      <h3 className="mt-1 text-lg font-semibold">
        <Link href={`/sticks/${product.slug}`} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-zinc-600">{product.summary}</p>
      <p className="mt-3 text-xl font-bold">
        €{product.priceIndicativeEur.value.toFixed(2)}
      </p>
      <div className="mt-1">
        <ProductNotice />
      </div>
      <div className="mt-4">
        <ProductProsAndCons product={product} limit={2} />
      </div>
      <div className="mt-4">
        <RetailerLinks brand={product.brand} productName={product.name} stack />
      </div>
    </Card>
  );
}
