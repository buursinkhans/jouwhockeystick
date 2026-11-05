import { isPriceFresh } from '@/catalog/offers/sort';
import { shoePath } from '@/catalog/shoes';
import { getShoeOffers, sizesInStockByShop } from '@/catalog/shoes/offers';
import type { Shoe } from '@/catalog/shoes/types';
import { OfferBlockView } from '@/components/offers/OfferBlockView';
import { OfferRows } from '@/components/offers/OfferRows';
import { OfferCardSummary } from '@/components/offers/OfferCardSummary';
import { OFFER_ANCHOR, OfferFoot } from '@/components/offers/WhereToBuy';
import { HOCKEYSCHOENEN } from '@/content/hockeyschoenen';
import { OFFER_TEXT } from '@/content/offers';
import { RETAILERS } from '@/lib/retailers';

const name = (shoe: Shoe) => `${shoe.brand} ${shoe.model}`;

/**
 * "Waar te koop" on a shoe page: the same rows, order and price rules as for
 * sticks (cheapest total first, no amount after 14 days). No size buttons:
 * the sizes in stock are listed per shop, only as the feed confirms them.
 */
export function ShoeWhereToBuy({ shoe }: { shoe: Shoe }) {
  const now = new Date();
  const offers = getShoeOffers(shoe);
  const pricedCount = offers.filter((o) => isPriceFresh(o, now)).length;
  const sizes = sizesInStockByShop(shoe);

  return (
    <section id={OFFER_ANCHOR} aria-labelledby="waar-te-koop-kop" className="mt-8 scroll-mt-24 card p-4 sm:p-5">
      <OfferBlockView placement="schoenpagina" offerCount={offers.length} pricedCount={pricedCount}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="waar-te-koop-kop" className="text-xl font-bold">
            {OFFER_TEXT.heading}
          </h2>
          {offers.length > 1 && <span className="text-xs text-inkt/70">{offers.length} winkels</span>}
        </div>
        {offers.length === 0 ? (
          <p className="mt-2 text-inkt/80">We kennen nog geen partnerwinkel die dit model verkoopt. Vraag ernaar bij je hockeywinkel.</p>
        ) : (
          <>
            <OfferRows
              brand={shoe.brand}
              productName={name(shoe)}
              placement="schoenpagina"
              offers={offers}
              nowIso={now.toISOString()}
              // Every shop at once, as on a stick page (2026-11-05).
              visible={offers.length}
              more={null}
              detail="full"
            />
            {sizes.length > 0 && (
              <div className="mt-3 text-sm">
                <h3 className="font-semibold">{HOCKEYSCHOENEN.model.sizesHeading}</h3>
                <ul className="mt-1 space-y-1 text-inkt/80">
                  {sizes.map((s) => (
                    <li key={s.shop}>
                      {RETAILERS[s.shop].label}: {s.sizes.join(', ')}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-inkt/70">{HOCKEYSCHOENEN.model.sizesNote}</p>
              </div>
            )}
            <OfferFoot offers={offers} now={now} item="schoen" />
          </>
        )}
      </OfferBlockView>
    </section>
  );
}

/** Under every shoe card: the same summary as a stick card (OfferCardSummary); shoes have no indicative price. */
export function ShoeOfferSummary({ shoe }: { shoe: Shoe }) {
  return (
    <OfferCardSummary
      brand={shoe.brand}
      productName={name(shoe)}
      placement="schoenencatalogus"
      offers={getShoeOffers(shoe)}
      compareHref={`${shoePath(shoe)}#${OFFER_ANCHOR}`}
    />
  );
}
