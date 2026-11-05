import Link from 'next/link';
import { isPriceFresh, sortOffers, totalPrice, type Offer } from '@/catalog/offers/sort';
import { RETAILERS, type RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, euro, shippingAt } from '@/content/offers';
import { PARTNER_LINK_URL } from '@/content/partnerLinks';
import { RetailerLink } from '@/components/ui/RetailerLink';
import { CompareLink } from './CompareLink';

function Arrow({ external = false }: { external?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {external ? <path d="M7 17L17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

/**
 * The bottom of every product card (2026-11-05): the comparison is the hero,
 * not the shop. The lowest current total of the shops in stock, how many
 * shops we compare, "Vergelijk prijzen" as the main action and the shop of
 * that price as a quiet direct link. Same order and price rules as "Waar te
 * koop" (docs/spec/prijsvergelijking.md); without a current price the
 * indicative price, marked as such. Server-rendered: the price is in the HTML.
 */
export function OfferCardSummary({
  brand,
  productName,
  placement,
  offers,
  compareHref,
  indicativeEur = null,
}: {
  brand: string;
  productName: string;
  placement: RetailerPlacement;
  offers: readonly Offer[];
  /** The "Waar te koop" block on the product page. */
  compareHref: string;
  /** Sticks have an indicative price; shoes do not. */
  indicativeEur?: number | null;
}) {
  const now = new Date();
  const sorted = sortOffers(offers, { size: null, now });
  const lowest = sorted.find((offer) => isPriceFresh(offer, now) && offer.inStock) ?? null;
  // The direct link goes to the shop of the lowest price, else to the first in the comparison order.
  const direct = lowest ?? sorted[0] ?? null;
  const count = offers.length;
  const label = lowest ? OFFER_TEXT.cardLowest : OFFER_TEXT.cardIndicative;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.04em] text-lijngrijs uppercase">{label}</p>
        {count > 0 && (
          <p className="shrink-0 text-xs text-lijngrijs">
            {count} {count === 1 ? 'winkel' : 'winkels'}
          </p>
        )}
      </div>
      {lowest ? (
        <>
          <p className="mt-1 font-heading text-[1.75rem] leading-tight font-extrabold text-inkt tabular-nums">
            {euro(totalPrice(lowest))}
          </p>
          <p className="text-sm text-inkt/75">{shippingAt(lowest.shippingEur, RETAILERS[lowest.retailer].label)}</p>
        </>
      ) : (
        <>
          <p className="mt-1 font-heading text-[1.75rem] leading-tight font-extrabold text-inkt/70 tabular-nums">
            {indicativeEur !== null ? euro(indicativeEur) : '–'}
          </p>
          <p className="text-sm text-inkt/75">{count === 0 ? OFFER_TEXT.cardNoShop : OFFER_TEXT.cardNoCurrentPrice}</p>
        </>
      )}

      {direct && (
        <div className="mt-4 flex flex-col gap-1">
          {count > 1 ? (
            <>
              <CompareLink href={compareHref} placement={placement} offerCount={count}>
                {/* Below 360 px "bij N winkels" drops: the count stands top right, the label stays on one line. */}
                <span>
                  Vergelijk prijzen<span className="hidden min-[360px]:inline"> bij {count} winkels</span>
                </span>
                <Arrow />
              </CompareLink>
              <RetailerLink
                retailer={direct.retailer}
                brand={brand}
                productName={productName}
                placement={placement}
                productUrl={direct.productUrl}
                offer={{ position: 1, offerCount: count, priceShown: lowest !== null }}
                className="mx-auto inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-veld hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld"
              >
                Direct naar {RETAILERS[direct.retailer].label}
                <Arrow external />
              </RetailerLink>
            </>
          ) : (
            <>
              <RetailerLink
                retailer={direct.retailer}
                brand={brand}
                productName={productName}
                placement={placement}
                productUrl={direct.productUrl}
                offer={{ position: 1, offerCount: 1, priceShown: lowest !== null }}
                variant="primary"
                className="w-full"
              >
                Bekijk bij {RETAILERS[direct.retailer].label}
                <Arrow external />
              </RetailerLink>
              <p className="flex min-h-11 items-center justify-center text-sm text-lijngrijs">
                {OFFER_TEXT.cardOnlyShop(RETAILERS[direct.retailer].label)}
              </p>
            </>
          )}
          <p className="mt-1 text-center text-xs text-lijngrijs">
            <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
              {OFFER_TEXT.cardPartnerNote}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
