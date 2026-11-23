import Link from 'next/link';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { cardPrice, getOffers, isPriceFresh } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import type { Product } from '@/catalog/types';
import { euro, inch } from '@/content/offers';

/** Where the specs of a stick come from, in one short label (bow, carbon and lengths). */
export function specSource(product: Product): string {
  const sources = [product.bowProfile?.source, product.carbonPercentage?.source, product.lengthsInches.source];
  const brand = sources.includes('brand-website');
  const shop = sources.includes('partner-shop');
  if (brand && shop) return 'Merksite en partnerwinkel';
  if (shop) return 'Partnerwinkel';
  return 'Merksite';
}

const bowName = (product: Product) => (product.bowProfile ? (BOW_LABELS[product.bowProfile.value].split(' / ')[0] ?? '') : '');
const lengths = (product: Product) => [...new Set(product.lengthsInches.value)].sort((a, b) => a - b).map(inch).join(' ');

/**
 * One group of sticks of a brand, from beginner to experienced and from little
 * to much carbon (the order of a range, not a ranking). The price is the lowest
 * current total including shipping with the number of shops, or the indicative
 * price marked as such; the shops themselves are on the page of each stick.
 */
export function BrandStickTable({
  caption,
  sticks,
  now,
}: {
  caption: string;
  sticks: readonly Product[];
  now: Date;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-rand text-lijngrijs">
            <th scope="col" className="py-2 pr-3 font-semibold">
              Model
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Niveau
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Kromming
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Carbon
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Lengtes
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              Bron specs
            </th>
            <th scope="col" className="py-2 font-semibold">
              Prijs
            </th>
          </tr>
        </thead>
        <tbody>
          {sticks.map((product) => {
            const offers = getOffers(product);
            const price = cardPrice(offers, product.priceIndicativeEur.value, now);
            const shops = offers.filter((o) => isPriceFresh(o, now)).length;
            return (
              <tr key={product.slug} className="border-b border-rand align-top">
                <th scope="row" className="py-3 pr-3 font-normal">
                  <Link href={productPath(product)} className="font-semibold text-veld hover:underline">
                    {product.name}
                  </Link>
                </th>
                <td className="py-3 pr-3">
                  {EXPERIENCE_LABELS[product.experienceLevel.value]}
                  {product.experienceLevel.source === 'editorial-estimate' && (
                    <span className="block text-xs text-lijngrijs">inschatting</span>
                  )}
                </td>
                <td className="py-3 pr-3">{bowName(product)}</td>
                <td className="py-3 pr-3">
                  {product.carbonPercentage?.value === 0 ? 'geen' : `${product.carbonPercentage?.value}%`}
                </td>
                <td className="py-3 pr-3">{lengths(product)}</td>
                <td className="py-3 pr-3 text-xs text-lijngrijs">{specSource(product)}</td>
                <td className="py-3">
                  {price.kind === 'shop' ? (
                    <>
                      <span className="font-semibold">{euro(price.totalEur)}</span>
                      <span className="block text-xs text-lijngrijs">
                        incl. verzending · {shops} {shops === 1 ? 'winkel' : 'winkels'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{price.totalEur !== null ? euro(price.totalEur) : '–'}</span>
                      <span className="block text-xs text-lijngrijs">richtprijs, geen actuele winkelprijs</span>
                    </>
                  )}
                  <Link href={productPath(product)} className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-veld hover:underline">
                    Bekijk maten en prijzen
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
