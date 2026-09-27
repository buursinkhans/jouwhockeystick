import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { buildCompareRows } from '@/catalog/compare';
import { ProductImage } from '@/components/catalog/ProductImage';
import { BolComLink } from '@/components/ui/BolComLink';

export const metadata: Metadata = {
  title: 'Vergelijk hockeysticks',
  description: 'Zet twee hockeysticks naast elkaar en vergelijk specificaties zoals carbonpercentage, gewicht, lengte en adviesprijs.',
};

export default async function VergelijkPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const products = getAllProducts();
  const productA = params.a ? getProductBySlug(params.a) : undefined;
  const productB = params.b ? getProductBySlug(params.b) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Vergelijk hockeysticks</h1>
      <p className="mt-2 text-zinc-600">
        Kies twee sticks om de specificaties naast elkaar te zien.
      </p>

      <form method="get" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="a" className="block text-sm font-medium">
            Stick 1
          </label>
          <select
            id="a"
            name="a"
            defaultValue={params.a ?? ''}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="" disabled>
              Kies een stick
            </option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.brand} — {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="b" className="block text-sm font-medium">
            Stick 2
          </label>
          <select
            id="b"
            name="b"
            defaultValue={params.b ?? ''}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="" disabled>
              Kies een stick
            </option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.brand} — {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Vergelijk
          </button>
        </div>
      </form>

      {productA && productB ? (
        <div className="mt-10">
          <div className="grid grid-cols-2 gap-4">
            {[productA, productB].map((product) => (
              <div key={product.slug} className="text-center">
                <ProductImage product={product} className="mx-auto h-20 w-20" />
                <p className="mt-2 font-semibold">
                  <Link href={`/sticks/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </p>
                <div className="mt-2">
                  <BolComLink
                    brand={product.brand}
                    productName={product.name}
                    variant="secondary"
                    className="text-sm"
                  >
                    Bekijk en koop op bol.com
                  </BolComLink>
                </div>
              </div>
            ))}
          </div>

          <table className="mt-6 w-full border-collapse text-left">
            <caption className="sr-only">
              Vergelijking van {productA.name} en {productB.name}
            </caption>
            <tbody>
              {buildCompareRows(productA, productB).map((row) => (
                <tr key={row.label} className="border-b border-zinc-200">
                  <th scope="row" className="w-1/3 py-3 pr-4 align-top text-sm font-semibold text-zinc-700">
                    {row.label}
                  </th>
                  <td className="py-3 pr-4 align-top">{row.valueA}</td>
                  <td className="py-3 align-top">{row.valueB}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-500">
            Bekijk de productpagina van elke stick voor de exacte bron en verificatiedatum per
            specificatie.
          </p>
        </div>
      ) : (
        <p className="mt-10 text-zinc-600">Kies hierboven twee sticks om ze te vergelijken.</p>
      )}
    </div>
  );
}
