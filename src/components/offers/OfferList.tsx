'use client';

import { useEffect, useState } from 'react';
import type { Brand } from '@/catalog/types';
import { isPriceFresh, sortOffers, totalPrice, type Offer } from '@/catalog/offers/sort';
import { RETAILERS, type RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, euro, inch, priceBreakdown, stockLine } from '@/content/offers';
import { RetailerLink } from '@/components/ui/RetailerLink';

/**
 * The size choice and the sorted shops of the full "Waar te koop" block on a
 * stick page. Client-side only because the order follows the chosen length;
 * the shops and prices come from the server (WhereToBuy).
 */
export function OfferList({
  brand,
  productName,
  offers,
  sizes,
  nowIso,
  placement,
}: {
  brand: Brand;
  productName: string;
  offers: readonly Offer[];
  /** Lengths to choose from, ascending. */
  sizes: readonly number[];
  /** The build time, so server and browser sort the same way. */
  nowIso: string;
  placement: RetailerPlacement;
}) {
  const [size, setSize] = useState<number | null>(null);
  const now = new Date(nowIso);

  // The stickwijzer links here with ?maat=36.5: start with the advised length.
  useEffect(() => {
    const asked = Number(new URLSearchParams(window.location.search).get('maat')?.replace(',', '.'));
    const match = sizes.find((s) => Math.abs(s - asked) < 0.01);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only known in the browser.
    if (match !== undefined) setSize(match);
  }, [sizes]);

  const sorted = sortOffers(offers, { size, now });

  return (
    <>
      {sizes.length > 1 && (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">{OFFER_TEXT.sizeLegend}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = size !== null && Math.abs(s - size) < 0.01;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSize(active ? null : s)}
                  className={`min-h-11 min-w-16 rounded-full border bg-white px-3.5 text-sm ${
                    active ? 'border-2 border-veld font-semibold text-veld' : 'border-lijngrijs text-inkt hover:border-veld'
                  }`}
                >
                  {inch(s)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <ol className="mt-4 space-y-3">
        {sorted.map((offer, index) => {
          const label = RETAILERS[offer.retailer].label;
          const fresh = isPriceFresh(offer, now);
          const stock = stockLine({ inStock: offer.inStock, lengths: offer.lengths, size });
          return (
            <li key={offer.retailer} className="rounded-2xl border border-rand bg-krijt p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{label}</span>
                {fresh ? (
                  <span className="text-xl font-bold">{euro(totalPrice(offer))}</span>
                ) : (
                  <span className="text-sm text-inkt/70">{OFFER_TEXT.noCurrentPrice}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-inkt/75">
                {fresh && offer.priceEur !== null ? `${priceBreakdown(offer.priceEur, offer.shippingEur)} · ${stock}` : stock}
              </p>
              <RetailerLink
                retailer={offer.retailer}
                brand={brand}
                productName={productName}
                placement={placement}
                productUrl={offer.productUrl}
                variant="shop"
                className="mt-3 w-full"
                offer={{ position: index + 1, offerCount: sorted.length, priceShown: fresh }}
                ariaLabel={fresh ? undefined : `${OFFER_TEXT.checkPrice} bij ${label}`}
              >
                {fresh ? `Naar ${label}` : OFFER_TEXT.checkPrice}
              </RetailerLink>
            </li>
          );
        })}
      </ol>
    </>
  );
}
