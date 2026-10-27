import Link from 'next/link';
import { getOffers, isPriceFresh, type Offer } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import type { Product } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, inch, readLine, shopCount } from '@/content/offers';
import { PARTNER_LINK_LABEL, PARTNER_LINK_URL } from '@/content/partnerLinks';
import { OfferBlockView } from './OfferBlockView';
import { OfferRows } from './OfferRows';

/** Rows before "Toon nog N winkels" on the stick page; in the stickwijzer and on cards fewer. */
const PAGE_ROWS = 3;
const ADVICE_ROWS = 2;

/** The id the stickwijzer's and the cards' "Vergelijk alle winkels" link to. */
export const OFFER_ANCHOR = 'waar-te-koop';

const compareHref = (product: Product, size: number | null) =>
  `${productPath(product)}${size !== null ? `?maat=${size}` : ''}#${OFFER_ANCHOR}`;

/** "Op prijs incl. verzending · gelezen op 27 okt" (one shop: no sort note). */
function footLine(offers: readonly Offer[], now: Date): string {
  const dates = offers.filter((o) => isPriceFresh(o, now)).flatMap((o) => (o.readAt ? [o.readAt] : []));
  return [offers.length > 1 ? 'Op prijs incl. verzending' : null, readLine(dates)]
    .filter((part): part is string => part !== null)
    .join(' · ');
}

function Foot({ offers, now }: { offers: readonly Offer[]; now: Date }) {
  const line = footLine(offers, now);
  return (
    <>
      <p className="mt-2 text-xs text-inkt/70">
        {line && <>{line} · </>}
        <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
          {PARTNER_LINK_LABEL}
        </Link>
        , de winkel is de verkoper
      </p>
      <details className="text-xs">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-veld">
          {OFFER_TEXT.howWeCompare}
        </summary>
        <p className="text-inkt/80">{OFFER_TEXT.howWeCompareText}</p>
        <p className="mt-1.5 text-inkt/80">{OFFER_TEXT.seller}</p>
      </details>
    </>
  );
}

/** Every length any shop or the brand lists, ascending: the size buttons. */
function sizeChoices(product: Product, offers: readonly Offer[]): number[] {
  const all = [...product.lengthsInches.value, ...offers.flatMap((o) => o.lengths ?? [])];
  return [...new Set(all.map((n) => Math.round(n * 10) / 10))].sort((a, b) => a - b);
}

/**
 * "Waar te koop" (docs/spec/prijsvergelijking.md, phase 1, compact design of
 * 2026-10-27): every partner shop that sells the stick as a short row,
 * cheapest price plus shipping first. `full` on the stick page (size
 * buttons, three rows, the rest folds out), `compact` in each stickwijzer
 * result (two rows in the advised length and a link to all shops).
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
  /** The advised length; the compact version sorts on it. */
  size?: number | null;
}) {
  const now = new Date();
  const offers = getOffers(product);
  const pricedCount = offers.filter((o) => isPriceFresh(o, now)).length;

  if (variant === 'compact') {
    return (
      <OfferBlockView placement={placement} offerCount={offers.length} pricedCount={pricedCount}>
        <div className="border-t border-rand pt-4">
          <h5 className="text-base font-bold">
            {OFFER_TEXT.heading}
            {size !== null && offers.length > 0 && ` in ${inch(size)}`}
          </h5>
          {offers.length === 0 ? (
            <p className="mt-2 text-sm text-inkt/80">{OFFER_TEXT.none}</p>
          ) : (
            <>
              <OfferRows
                brand={product.brand}
                productName={product.name}
                placement={placement}
                offers={offers}
                nowIso={now.toISOString()}
                size={size}
                visible={ADVICE_ROWS}
                more={{ kind: 'link', href: compareHref(product, size) }}
                detail="full"
              />
              <Foot offers={offers} now={now} />
            </>
          )}
        </div>
      </OfferBlockView>
    );
  }

  return (
    <section id={OFFER_ANCHOR} aria-labelledby="waar-te-koop-kop" className="mt-8 scroll-mt-24 rounded-2xl border border-rand bg-white p-4 shadow-sm sm:p-5">
      <OfferBlockView placement={placement} offerCount={offers.length} pricedCount={pricedCount}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="waar-te-koop-kop" className="text-xl font-bold">
            {OFFER_TEXT.heading}
          </h2>
          {offers.length > 1 && <span className="text-xs text-inkt/70">{offers.length} winkels</span>}
        </div>
        {offers.length === 0 ? (
          <p className="mt-2 text-inkt/80">{OFFER_TEXT.noneOnPage}</p>
        ) : (
          <>
            <OfferRows
              brand={product.brand}
              productName={product.name}
              placement={placement}
              offers={offers}
              nowIso={now.toISOString()}
              sizes={sizeChoices(product, offers)}
              sizeFromUrl
              visible={PAGE_ROWS}
              more={{ kind: 'expand' }}
              detail="full"
            />
            <Foot offers={offers} now={now} />
          </>
        )}
      </OfferBlockView>
    </section>
  );
}

/**
 * Under every stick card (catalog, compare page, indoor selector): the shop
 * with the lowest price plus shipping as one row, and a link to all shops on
 * the stick page. No shop known: the indicative price, marked as such.
 */
export function OfferSummary({ product, placement }: { product: Product; placement: RetailerPlacement }) {
  const now = new Date();
  const offers = getOffers(product);
  const priced = offers.some((o) => isPriceFresh(o, now));

  return (
    <div>
      {!priced && (
        <p className="text-sm text-inkt/70">
          Richtprijs €{product.priceIndicativeEur.value.toFixed(2).replace('.', ',')}
          {offers.length === 0 && ' · nog geen partnerwinkel bekend'}
        </p>
      )}
      {offers.length > 0 && (
        <>
          <OfferRows
            brand={product.brand}
            productName={product.name}
            placement={placement}
            offers={offers}
            nowIso={now.toISOString()}
            visible={1}
            more={{ kind: 'link', href: compareHref(product, null) }}
            detail="short"
          />
          <p className="mt-1 text-xs text-inkt/70">
            {offers.length === 1 && <>{shopCount(1)} · </>}
            <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
              {PARTNER_LINK_LABEL}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
