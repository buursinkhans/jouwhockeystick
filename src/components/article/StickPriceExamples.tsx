import Link from 'next/link';
import { getFieldProducts, getIndoorProducts } from '@/catalog';
import { comparableSticks } from '@/catalog/comparable';
import { productPath } from '@/catalog/paths';
import { OfferSummary } from '@/components/offers/WhereToBuy';

/**
 * The block `stickPrices` of an article (wave 1, 2026-11-22): one field and one
 * indoor stick with their current shop prices, so a reader can see what a
 * stick costs now. The sticks are the ones the black-friday page picks for a
 * price comparison (`comparableSticks`): a current price at two or more
 * partner shops, one per brand, the most specs from the brand first. Neither a
 * fee nor a discount plays a part. The price is the lowest total including
 * shipping with its date, from OfferSummary; no old or "from" prices.
 */
export function StickPriceExamples() {
  const now = new Date();
  const examples = [
    { kind: 'Veldstick', product: comparableSticks(getFieldProducts(now), now, 1)[0] },
    { kind: 'Zaalstick', product: comparableSticks(getIndoorProducts(now), now, 1)[0] },
  ].flatMap(({ kind, product }) => (product ? [{ kind, product }] : []));

  if (examples.length === 0) {
    return (
      <p className="mt-3 leading-relaxed text-inkt/80">
        Op dit moment hebben we geen veld- of zaalstick met een actuele prijs bij twee of meer partnerwinkels om hier te
        laten zien.
      </p>
    );
  }
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {examples.map(({ kind, product }) => (
        <li key={product.slug} className="card flex flex-col gap-2 p-4">
          <p className="text-xs font-semibold tracking-wide text-veld uppercase">{kind}</p>
          <p className="font-bold">
            <Link href={productPath(product)} className="hover:underline">
              {product.name}
            </Link>
          </p>
          <OfferSummary product={product} placement="artikel" />
        </li>
      ))}
    </ul>
  );
}
