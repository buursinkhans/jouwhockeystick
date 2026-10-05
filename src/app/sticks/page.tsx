import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllBrands, getAllProducts } from '@/catalog';
import type { Brand } from '@/catalog/types';
import { ProductGrid } from '@/components/catalog/ProductGrid';

export const metadata = pageMetadata({
  title: 'Alle hockeysticks',
  description:
    'Bekijk alle hockeysticks in de catalogus van jouwhockeystick.nl, met richtprijzen en sterke/aandachtspunten per stick.',
  path: '/sticks',
});

function isValidBrand(
  value: string | undefined,
  brands: Brand[],
): value is Brand {
  return value !== undefined && brands.includes(value as Brand);
}

export default async function SticksPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const brands = getAllBrands();
  const activeBrand = isValidBrand(brand, brands) ? brand : undefined;
  const products = getAllProducts().filter(
    (p) => !activeBrand || p.brand === activeBrand,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Alle hockeysticks</h1>
      <p className="mt-2 max-w-2xl text-lijngrijs">
        Twijfel je welke bij je past? Doorloop de{' '}
        <Link
          href="/stickwijzer"
          className="font-semibold text-veld hover:underline"
        >
          stickwijzer
        </Link>{' '}
        voor een persoonlijk advies.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/sticks"
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            !activeBrand
              ? 'border-veld bg-veld text-white'
              : 'border-lijngrijs text-inkt/80 hover:border-veld'
          }`}
        >
          Alle merken
        </Link>
        {brands.map((b) => (
          <Link
            key={b}
            href={`/sticks?brand=${encodeURIComponent(b)}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              activeBrand === b
                ? 'border-veld bg-veld text-white'
                : 'border-lijngrijs text-inkt/80 hover:border-veld'
            }`}
          >
            {b}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
