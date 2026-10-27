import Link from 'next/link';
import { getOffers, isPriceFresh, sortOffers, totalPrice, type Offer } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import type { Product } from '@/catalog/types';
import { RETAILERS, type RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, euro, inch, readLine, shopCount, stockLine } from '@/content/offers';
import { PARTNER_LINK_LABEL, PARTNER_LINK_URL } from '@/content/partnerLinks';
import { RetailerLink } from '@/components/ui/RetailerLink';
import { OfferBlockView } from './OfferBlockView';
import { OfferList } from './OfferList';

/** In the stickwijzer card: the two cheapest shops in the advised length. */
const COMPACT_ROWS = 2;

/** The id the stickwijzer's "Vergelijk alle winkels" links to. */
export const OFFER_ANCHOR = 'waar-te-koop';

function HowWeCompare() {
  return (
    <details className="mt-4 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-veld">
        {OFFER_TEXT.howWeCompare}
      </summary>
      <p className="mt-1 text-inkt/80">{OFFER_TEXT.howWeCompareText}</p>
      <p className="mt-2 text-inkt/80">
        {OFFER_TEXT.seller}{' '}
        <Link href={PARTNER_LINK_URL} className="text-veld underline">
          Meer over partnerlinks
        </Link>
      </p>
    </details>
  );
}

/** "3 partnerwinkels · op prijs incl. verzending · gelezen op 26 okt" (one shop: no sort note). */
function summaryLine(offers: readonly Offer[], now: Date): string {
  const dates = offers.filter((o) => isPriceFresh(o, now)).flatMap((o) => (o.readAt ? [o.readAt] : []));
  return [shopCount(offers.length), offers.length > 1 ? OFFER_TEXT.sortNote : null, readLine(dates)]
    .filter((part): part is string => part !== null)
    .join(' · ');
}

/** Every length any shop or the brand lists, ascending: the choices of the size buttons. */
function sizeChoices(product: Product, offers: readonly Offer[]): number[] {
  const all = [...product.lengthsInches.value, ...offers.flatMap((o) => o.lengths ?? [])];
  return [...new Set(all.map((n) => Math.round(n * 10) / 10))].sort((a, b) => a - b);
}

/**
 * "Waar te koop" (docs/spec/prijsvergelijking.md, phase 1): every partner
 * shop that sells the stick, sorted on price plus shipping, with the date
 * the price was read. Replaces the loose shop buttons on the stick page
 * (`full`) and in each stickwijzer result (`compact`). Server component;
 * only the size choice (OfferList) runs in the browser.
 */
export function WhereToBuy({
  product,
  placement,
  variant,
  size = null,
}: {
  product: Product;
  placement: RetailerPlacement;
  variant: 'full' | 'compact';
  /** The advised or chosen length; the compact version sorts on it. */
  size?: number | null;
}) {
  const now = new Date();
  const offers = getOffers(product);
  const pricedCount = offers.filter((o) => isPriceFresh(o, now)).length;

  if (variant === 'compact') {
    const sorted = sortOffers(offers, { size, now });
    const shown = sorted.slice(0, COMPACT_ROWS);
    return (
      <OfferBlockView placement={placement} offerCount={offers.length} pricedCount={pricedCount}>
        <div className="border-t border-lijngrijs/50 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h5 className="text-base font-semibold">{OFFER_TEXT.heading}</h5>
            {size !== null && offers.length > 0 && <span className="text-xs text-inkt/70">in {inch(size)}</span>}
          </div>
          {offers.length === 0 ? (
            <p className="mt-2 text-sm text-inkt/80">{OFFER_TEXT.none}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {shown.map((offer, index) => {
                  const label = RETAILERS[offer.retailer].label;
                  const fresh = isPriceFresh(offer, now);
                  const shipping =
                    offer.shippingEur === null ? 'verzendkosten onbekend' : offer.shippingEur === 0 ? 'gratis verzending' : `incl. ${euro(offer.shippingEur)} verzending`;
                  return (
                    <li key={offer.retailer}>
                      <RetailerLink
                        retailer={offer.retailer}
                        brand={product.brand}
                        productName={product.name}
                        placement={placement}
                        productUrl={offer.productUrl}
                        offer={{ position: index + 1, offerCount: offers.length, priceShown: fresh }}
                        ariaLabel={fresh ? `Naar ${label}, ${euro(totalPrice(offer))} inclusief verzending` : `${OFFER_TEXT.checkPrice} bij ${label}`}
                        className="flex min-h-13 items-center justify-between gap-3 rounded-xl border border-lijngrijs/60 bg-white px-3.5 py-2.5 text-inkt hover:border-veld"
                      >
                        <span className="flex flex-col">
                          <span className="text-[15px] font-semibold">{label}</span>
                          <span className="text-xs text-inkt/75">
                            {fresh ? `${shipping} · ${stockLine({ inStock: offer.inStock, lengths: offer.lengths, size })}` : OFFER_TEXT.checkPrice}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {fresh && <span className="text-base font-semibold">{euro(totalPrice(offer))}</span>}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-veld">
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </span>
                      </RetailerLink>
                    </li>
                  );
                })}
              </ul>
              {offers.length > COMPACT_ROWS && (
                <Link
                  href={`${productPath(product)}${size !== null ? `?maat=${size}` : ''}#${OFFER_ANCHOR}`}
                  className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-veld px-4 text-[15px] font-semibold text-white hover:bg-veld/90"
                >
                  Vergelijk alle {offers.length} winkels
                </Link>
              )}
              <p className="mt-3 text-xs text-inkt/75">{summaryLine(offers, now)}.</p>
              <HowWeCompare />
            </>
          )}
        </div>
      </OfferBlockView>
    );
  }

  return (
    <section id={OFFER_ANCHOR} aria-labelledby="waar-te-koop-kop" className="mt-8 scroll-mt-24 rounded-2xl border border-rand bg-white p-4 shadow-sm sm:p-6">
      <OfferBlockView placement={placement} offerCount={offers.length} pricedCount={pricedCount}>
        <h2 id="waar-te-koop-kop" className="text-2xl font-bold">
          {OFFER_TEXT.heading}
        </h2>
        {offers.length === 0 ? (
          <p className="mt-2 text-inkt/80">{OFFER_TEXT.noneOnPage}</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-inkt/75">{summaryLine(offers, now)}</p>
            <OfferList
              brand={product.brand}
              productName={product.name}
              offers={offers}
              sizes={sizeChoices(product, offers)}
              nowIso={now.toISOString()}
              placement={placement}
            />
            <p className="mt-3 text-xs text-inkt/75">
              <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
                {PARTNER_LINK_LABEL}
              </Link>{' '}
              · {OFFER_TEXT.seller}
            </p>
            <HowWeCompare />
          </>
        )}
      </OfferBlockView>
    </section>
  );
}
