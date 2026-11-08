'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { freshnessNow, hasLowestBadge, isPriceFresh, sortOffers, totalPrice, type Offer } from '@/catalog/offers/sort';
import { RETAILERS, type RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, euro, inch, priceBreakdown, stockLine } from '@/content/offers';
import { RetailerLink } from '@/components/ui/RetailerLink';

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-veld">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/**
 * The shops of one stick as compact rows, cheapest total (price plus
 * shipping) first: "Bekijk prijs bij [winkel]" (owner, 2026-11-08: the visitor
 * checks the price at the shop, which sells), shipping and stock, the total price.
 * The top row has a slightly heavier border when it shows a current price;
 * that is the lowest price, never a choice by commission
 * (docs/spec/prijsvergelijking.md §2). Used on the stick page, in the
 * stickwijzer and on every stick card.
 */
export function OfferRows({
  brand,
  productName,
  placement,
  offers,
  nowIso,
  sizes = [],
  size: givenSize = null,
  sizeFromUrl = false,
  visible,
  more = null,
  detail,
}: {
  /** Stick or shoe brand (shoe brands are not in the stick Brand list). */
  brand: string;
  productName: string;
  placement: RetailerPlacement;
  offers: readonly Offer[];
  /**
   * When the page was rendered: the first render in the browser uses it too,
   * so it matches the server. After mount the browser's date takes over.
   */
  nowIso: string;
  /** Lengths for the size buttons; none = no buttons. */
  sizes?: readonly number[];
  /** The advised length (stickwijzer); the rows sort on it. */
  size?: number | null;
  /** Start with the length in `?maat=` (stick page, linked from the stickwijzer). */
  sizeFromUrl?: boolean;
  /** Rows shown before "Toon nog N winkels" or the link to all shops. */
  visible: number;
  /** After the visible rows: fold out the rest here, or link to the full block. */
  more?: { kind: 'expand' } | { kind: 'link'; href: string } | null;
  /** 'full': shipping and stock per row; 'short': only "incl. verzending" (stick cards). */
  detail: 'full' | 'short';
}) {
  const [size, setSize] = useState<number | null>(givenSize);
  const [open, setOpen] = useState(false);
  // Static pages keep the build date; recheck freshness with the browser's
  // date after mount, so a price older than 14 days hides its amount and the
  // "Laagste prijs" badge (code review 2026-11-08). No hydration mismatch:
  // the first render is the server's.
  const [now, setNow] = useState(() => new Date(nowIso));
  useEffect(() => {
    const browserNow = freshnessNow(nowIso, Date.now());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser's date is only known after mount.
    if (browserNow.getTime() !== Date.parse(nowIso)) setNow(browserNow);
  }, [nowIso]);

  useEffect(() => {
    if (!sizeFromUrl) return;
    const asked = Number(new URLSearchParams(window.location.search).get('maat')?.replace(',', '.'));
    const match = sizes.find((s) => Math.abs(s - asked) < 0.01);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only known in the browser.
    if (match !== undefined) setSize(match);
  }, [sizeFromUrl, sizes]);

  const sorted = sortOffers(offers, { size, now });
  const badge = hasLowestBadge(sorted, { size, now });
  const shown = open ? sorted : sorted.slice(0, visible);
  const hidden = sorted.length - shown.length;

  return (
    <>
      {sizes.length > 1 && (
        <fieldset className="mt-3 flex flex-wrap items-center gap-1.5">
          <legend className="sr-only">{OFFER_TEXT.sizeLegend}</legend>
          <span aria-hidden="true" className="mr-1 text-sm font-semibold">
            Maat
          </span>
          {sizes.map((s) => {
            const active = size !== null && Math.abs(s - size) < 0.01;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setSize(active ? null : s)}
                className={`min-h-11 min-w-13 rounded-full bg-white px-2.5 text-sm ${
                  active ? 'border-2 border-veld font-bold text-veld' : 'border border-lijngrijs text-inkt hover:border-veld'
                }`}
              >
                {inch(s)}
              </button>
            );
          })}
        </fieldset>
      )}

      <ul className="mt-3 flex flex-col gap-1.5">
        {shown.map((offer, index) => {
          const label = RETAILERS[offer.retailer].label;
          const fresh = isPriceFresh(offer, now);
          const top = index === 0 && fresh;
          const withBadge = index === 0 && badge;
          const stock = stockLine({ inStock: offer.inStock, lengths: offer.lengths, size });
          const meta =
            detail === 'short'
              ? fresh
                ? offer.shippingEur === null
                  ? 'verzendkosten onbekend'
                  : 'incl. verzending'
                : offer.inStock
                  ? 'prijs bij de winkel'
                  : 'niet op voorraad volgens de feed'
              : fresh
                ? // With paid shipping the sum is visible: price + shipping, the total on the right (2026-11-05).
                  `${
                    offer.shippingEur === null
                      ? 'verzendkosten onbekend'
                      : offer.shippingEur === 0
                        ? 'gratis verzending'
                        : priceBreakdown(offer.priceEur ?? 0, offer.shippingEur)
                  } · ${stock}`
                : stock;
          return (
            <li key={offer.retailer} className={withBadge ? 'pt-2.5' : undefined}>
              <RetailerLink
                retailer={offer.retailer}
                brand={brand}
                productName={productName}
                placement={placement}
                productUrl={offer.productUrl}
                offer={{ position: index + 1, offerCount: sorted.length, priceShown: fresh }}
                ariaLabel={
                  fresh
                    ? `Bekijk prijs bij ${label}, ${euro(totalPrice(offer))} inclusief verzending${withBadge ? `, ${OFFER_TEXT.lowestBadge.toLowerCase()}` : ''}`
                    : `Bekijk prijs bij ${label}, ${OFFER_TEXT.checkPrice.toLowerCase()}`
                }
                className={`relative flex min-h-14 items-center justify-between gap-3 rounded-xl bg-white text-inkt ${
                  top ? `border-2 border-veld px-[11px] ${withBadge ? 'pt-[13px] pb-[7px]' : 'py-[7px]'}` : 'border border-rand px-3 py-2 hover:border-veld'
                }`}
              >
                {withBadge && (
                  // On the border, like a tab: the eye lands on the lowest price first (owner, 2026-11-05).
                  <span className="absolute -top-2.5 left-[11px] rounded-full bg-veld px-2 py-0.5 text-[11px] leading-4 font-bold tracking-[0.02em] text-white shadow-sm">
                    {OFFER_TEXT.lowestBadge}
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-bold text-veld">Bekijk prijs bij {label}</span>
                  <span className="text-xs text-inkt/70">{meta}</span>
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {fresh ? (
                    <span className="text-[17px] font-bold">{euro(totalPrice(offer))}</span>
                  ) : (
                    <span className="text-sm text-inkt/70">Bekijk prijs</span>
                  )}
                  <Chevron />
                </span>
              </RetailerLink>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && more?.kind === 'expand' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1.5 flex min-h-11 w-full items-center justify-center gap-1.5 text-sm font-semibold text-veld"
        >
          Toon nog {hidden} {hidden === 1 ? 'winkel' : 'winkels'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
      {sorted.length > visible && more?.kind === 'link' && (
        <Link href={more.href} className="mt-1.5 flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold text-veld hover:underline">
          Vergelijk alle {sorted.length} winkels
          <Chevron />
        </Link>
      )}
    </>
  );
}
