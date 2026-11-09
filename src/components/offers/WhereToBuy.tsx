import Link from 'next/link';
import { getOffers, isPriceFresh, sizeStock, type Offer } from '@/catalog/offers';
import { productPath } from '@/catalog/paths';
import type { Product } from '@/catalog/types';
import type { RetailerPlacement } from '@/lib/retailers';
import { OFFER_TEXT, inch, readLine, sizeStockLine } from '@/content/offers';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';
import { PARTNER_LINK_LABEL, PARTNER_LINK_URL } from '@/content/partnerLinks';
import { OfferBlockView } from './OfferBlockView';
import { OfferRows } from './OfferRows';
import { OfferCardSummary } from './OfferCardSummary';

/** Rows in the stickwijzer before the link to all shops; the stick page shows every shop (2026-11-05). */
const ADVICE_ROWS = 2;

/** The id of "Waar te koop", for the "vanaf" price on the product page itself. */
export const OFFER_ANCHOR = 'waar-te-koop';

/**
 * The comparison links of cards and advice go to the top of the product
 * page, not to #waar-te-koop (2026-11-05): on a laptop the block sits in the
 * sticky right column, and the jump scrolled the page to halfway the specs.
 * The top shows photo, name, price and the shops on every screen.
 */
const compareHref = (product: Product, size: number | null) =>
  `${productPath(product)}${size !== null ? `?maat=${size}` : ''}`;

/** "Op prijs incl. verzending · gelezen op 27 okt" (one shop: no sort note). */
function footLine(offers: readonly Offer[], now: Date): string {
  const dates = offers.filter((o) => isPriceFresh(o, now)).flatMap((o) => (o.readAt ? [o.readAt] : []));
  return [offers.length > 1 ? 'Op prijs incl. verzending' : null, readLine(dates)]
    .filter((part): part is string => part !== null)
    .join(' · ');
}

/** Read date, partner-link note and "Hoe vergelijken we?", under every "Waar te koop" (sticks and shoes). */
export function OfferFoot({
  offers,
  now,
  item = 'stick',
}: {
  offers: readonly Offer[];
  now: Date;
  /** What one order is: a stick, or a pair of shoes. */
  item?: 'stick' | 'schoen';
}) {
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
        <p className="text-inkt/80">{item === 'schoen' ? OFFER_TEXT.howWeCompareTextShoe : OFFER_TEXT.howWeCompareText}</p>
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
    const stock = size !== null ? sizeStock(offers, { size, now }) : null;
    // "Unknown" is left out here: the rows below already say "maat kiezen bij de winkel".
    const stockLine = stock && size !== null ? sizeStockLine(stock, size) : null;
    const stockText = stockLine?.tone === 'unknown' ? null : stockLine;
    return (
      <OfferBlockView
        placement={placement}
        offerCount={offers.length}
        pricedCount={pricedCount}
        {...(stock && { inSizeCount: stock.inSize })}
      >
        <div className="border-t border-rand pt-4">
          <h5 className="text-base font-bold">
            {OFFER_TEXT.heading}
            {size !== null && offers.length > 0 && ` in ${inch(size)}`}
          </h5>
          {stockText && (
            <p className={`mt-1.5 flex items-start gap-1.5 text-sm ${stockText.tone === 'yes' ? 'text-inkt' : 'text-inkt/80'}`}>
              {stockText.tone === 'yes' ? (
                <CheckIcon size={16} className="mt-0.5 shrink-0 text-veld" />
              ) : stockText.tone === 'none' ? (
                <AlertIcon size={16} className="mt-0.5 shrink-0 text-inkt/60" />
              ) : null}
              <span>{stockText.text}</span>
            </p>
          )}
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
              <OfferFoot offers={offers} now={now} />
            </>
          )}
        </div>
      </OfferBlockView>
    );
  }

  return (
    <section id={OFFER_ANCHOR} aria-labelledby="waar-te-koop-kop" className="mt-8 scroll-mt-24 card p-4 sm:p-5">
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
              visible={offers.length}
              more={null}
              detail="full"
            />
            <OfferFoot offers={offers} now={now} />
          </>
        )}
      </OfferBlockView>
    </section>
  );
}

/**
 * Under every stick card (catalog, compare page, indoor selector): the lowest
 * current total, the number of shops, "Bekijk maten en prijzen" to the stick page
 * and a direct link to the shop of that price (OfferCardSummary). No current
 * price: the indicative price, marked as such.
 */
export function OfferSummary({ product, placement }: { product: Product; placement: RetailerPlacement }) {
  return (
    <OfferCardSummary
      brand={product.brand}
      productName={product.name}
      placement={placement}
      offers={getOffers(product)}
      compareHref={compareHref(product, null)}
      indicativeEur={product.priceIndicativeEur.value}
    />
  );
}
