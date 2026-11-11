import Link from 'next/link';
import { productPath } from '@/catalog/paths';
import { BOW_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';
import { inch } from '@/content/offers';
import { ZAAL } from '@/content/zaal';

/**
 * The hand-checked indoor sticks side by side (SEO and GEO sprint 2026-11-11):
 * the page title promises "zaalsticks vergeleken", and a table is the form a
 * visitor and an AI search engine can read at a glance. Server-rendered, built
 * from catalog data only; a missing carbon percentage or bow profile says
 * "niet vermeld" and is never filled in. Prices are the indicative prices
 * (marked as such); current shop prices stay on the stick pages and cards.
 */
export function IndoorCompareTable({ products }: { products: readonly Product[] }) {
  if (products.length === 0) return null;
  const rows = [...products].sort(
    (a, b) => a.priceIndicativeEur.value - b.priceIndicativeEur.value || a.name.localeCompare(b.name),
  );

  return (
    <section className="mt-16" aria-labelledby="zaal-vergelijk-heading">
      <h2 id="zaal-vergelijk-heading" className="text-2xl font-bold">
        {ZAAL.compare.heading}
      </h2>
      <p className="mt-1 max-w-3xl text-inkt/80">{ZAAL.compare.intro}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">{ZAAL.compare.caption}</caption>
          <thead>
            <tr className="border-b border-rand text-lijngrijs">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Stick
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Lengtes
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Carbon
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Bow-profiel
              </th>
              <th scope="col" className="py-2 font-semibold">
                Richtprijs
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.slug} className="border-b border-rand">
                <th scope="row" className="py-2 pr-3 font-normal">
                  <Link href={productPath(p)} className="text-veld hover:underline">
                    {p.name}
                  </Link>
                </th>
                <td className="py-2 pr-3">{[...p.lengthsInches.value].sort((a, b) => a - b).map(inch).join(', ')}</td>
                <td className="py-2 pr-3">{p.carbonPercentage ? `${p.carbonPercentage.value}%` : ZAAL.compare.unknown}</td>
                <td className="py-2 pr-3">{p.bowProfile ? BOW_LABELS[p.bowProfile.value] : ZAAL.compare.unknown}</td>
                <td className="py-2">€{Math.round(p.priceIndicativeEur.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-lijngrijs">{ZAAL.compare.note}</p>
    </section>
  );
}
