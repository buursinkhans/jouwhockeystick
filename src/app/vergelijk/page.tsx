import { productPath } from '@/catalog/paths';

import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllProducts, getCatalogProducts, getProductBySlug } from '@/catalog';
import { buildCompareRows } from '@/catalog/compare';
import { getSimilarSticks } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import { ProductImage } from '@/components/catalog/ProductImage';
import { OfferSummary } from '@/components/offers/WhereToBuy';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';

export const metadata = pageMetadata({
  title: 'Vergelijk hockeysticks',
  description:
    'Zet twee hockeysticks naast elkaar en vergelijk specificaties zoals carbonpercentage, gewicht, lengte en adviesprijs.',
  path: '/vergelijk',
});

const compareHref = (a: Product, b: Product) => `/vergelijk?a=${a.slug}&b=${b.slug}`;

/** One select per stick, grouped by brand, so a list of hundreds stays scannable. */
function StickSelect({
  id,
  label,
  value,
  groups,
}: {
  id: 'a' | 'b';
  label: string;
  value: string | undefined;
  groups: ReadonlyArray<[string, Product[]]>;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={value ?? ''}
        className="mt-1 min-h-11 w-full rounded-xl border border-rand bg-white px-3 py-2"
      >
        <option value="" disabled>
          Kies een stick
        </option>
        {groups.map(([brand, products]) => (
          <optgroup key={brand} label={brand}>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

/** Links that open a comparison straight away. */
function PairLinks({ title, pairs }: { title: string; pairs: ReadonlyArray<[Product, Product]> }) {
  if (pairs.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="pairs-heading">
      <h2 id="pairs-heading" className="text-lg font-bold">
        {title}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {pairs.map(([a, b]) => (
          <li key={`${a.slug}-${b.slug}`}>
            <Link
              href={compareHref(a, b)}
              className="flex h-full flex-col rounded-2xl border border-rand bg-white p-4 hover:border-veld"
            >
              <span className="flex items-center gap-2" aria-hidden="true">
                <ProductImage product={a} className="h-14 w-14" />
                <span className="text-sm font-semibold text-lijngrijs">vs</span>
                <ProductImage product={b} className="h-14 w-14" />
              </span>
              <span className="mt-3 text-sm font-semibold text-inkt">
                {a.name} <span className="font-normal text-lijngrijs">en</span> {b.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function VergelijkPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const products = getAllProducts(now, { includeImported: true });
  const productA = params.a ? getProductBySlug(params.a) : undefined;
  const productB = params.b ? getProductBySlug(params.b) : undefined;

  const byBrand = new Map<string, Product[]>();
  for (const product of [...products].sort((x, y) => x.name.localeCompare(y.name, 'nl'))) {
    byBrand.set(product.brand, [...(byBrand.get(product.brand) ?? []), product]);
  }
  const groups = [...byBrand.entries()].sort(([x], [y]) => x.localeCompare(y, 'nl'));

  // With one stick chosen (from a stick page or an advice): its closest
  // matches. With none: three hand-checked sticks and their closest match.
  const suggestions: Array<[Product, Product]> =
    productA && !productB
      ? getSimilarSticks(productA, products).map(({ product }) => [productA, product])
      : !productA
        ? getCatalogProducts()
            .slice(0, 3)
            .flatMap((first): Array<[Product, Product]> => {
              const [other] = getSimilarSticks(first, products, 1);
              return other ? [[first, other.product]] : [];
            })
        : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Vergelijk hockeysticks</h1>
      <p className="mt-2 text-lijngrijs">
        Kies twee sticks om de specificaties naast elkaar te zien. Verschillen zijn gemarkeerd.
      </p>

      <form method="get" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StickSelect id="a" label="Stick 1" value={params.a} groups={groups} />
        <StickSelect id="b" label="Stick 2" value={params.b} groups={groups} />
        <div className="sm:col-span-2">
          <button type="submit" className={`${buttonBaseClasses} ${buttonVariantClasses.primary} min-h-11`}>
            Vergelijk
          </button>
        </div>
      </form>

      {productA && productB ? (
        <div className="mt-10">
          <div className="grid grid-cols-2 gap-4">
            {[productA, productB].map((product) => (
              <div key={product.slug} className="flex flex-col items-center text-center">
                <ProductImage product={product} className="h-28 w-28 sm:h-36 sm:w-36" />
                <p className="mt-1 text-xs font-semibold tracking-wide text-veld uppercase">{product.brand}</p>
                <p className="mt-1 font-semibold">
                  <Link href={productPath(product)} className="hover:underline">
                    {product.name}
                  </Link>
                </p>
                <div className="mt-3 w-full">
                  <OfferSummary product={product} placement="vergelijk" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Vergelijking van {productA.name} en {productB.name}; rijen met een verschil zijn gemarkeerd
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Eigenschap</th>
                  <th scope="col">{productA.name}</th>
                  <th scope="col">{productB.name}</th>
                </tr>
              </thead>
              <tbody>
                {buildCompareRows(productA, productB).map((row) => {
                  const differs = row.valueA !== row.valueB;
                  return (
                    <tr key={row.label} className={`border-b border-rand ${differs ? 'bg-krijt' : ''}`}>
                      <th scope="row" className="w-1/3 py-3 pr-4 pl-2 align-top text-sm font-semibold text-inkt/80">
                        {row.label}
                        {differs && <span className="sr-only"> (verschilt)</span>}
                      </th>
                      <td className={`py-3 pr-4 align-top ${differs ? 'font-semibold' : ''}`}>{row.valueA}</td>
                      <td className={`py-3 pr-2 align-top ${differs ? 'font-semibold' : ''}`}>{row.valueB}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-lijngrijs">
            Bekijk de productpagina van elke stick voor de exacte bron en
            verificatiedatum per specificatie.
          </p>
        </div>
      ) : (
        <PairLinks
          title={productA ? `Vergelijk ${productA.name} met` : 'Of begin met een van deze vergelijkingen'}
          pairs={suggestions}
        />
      )}
    </div>
  );
}
