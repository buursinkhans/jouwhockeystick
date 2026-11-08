/**
 * Shop offers kept apart from the product data (docs/spec/prijsvergelijking.md
 * §3.2): per stick, every partner shop that sells it, with the feed price,
 * shipping, stock and the date we read it. Shown in "Waar te koop"
 * (src/components/offers/WhereToBuy.tsx), sorted by total price. Commission,
 * network and cookie length play no part anywhere here.
 */
import { SHIPPING, shippingCostEur, type RetailerId } from '@/lib/retailers';
import { isSoldAtBol } from '../shop';
import type { Product } from '../types';
import { PASSAHOCKEY_LIVE_PRICES } from '../imported/passaPrices';
import type { ShoeListing } from '../shoes/types';
import { BOL_PRICES } from './bolPrices';
import { DAKA_OFFERS } from './daka';
import { HOCKEYCITY_OFFERS } from './hockeyCity';
import { PLUTOSPORT_MATCHES } from './matches';
import type { Offer } from './sort';

export type { Offer, SizeStock } from './sort';
export { MAX_PRICE_AGE_DAYS, hasLength, isPriceFresh, lowestTotal, sizeStock, sortOffers, totalPrice } from './sort';

export type PlutosportMatch = {
  /** Product page on plutosport.nl; the tracking link is built in src/lib/retailers.ts. */
  productUrl: string;
  /** How the feed script matched it (both count as 'zeker'). */
  method: 'ean' | 'naam';
  /** Lowest price of a length in stock, incl. btw (since 2026-10-27; older files lack it). */
  priceEur?: number;
  /** Lengths in inches in stock. */
  lengths?: readonly number[];
};

export type PlutosportMatches = {
  /** YYYY-MM-DD: when the feed was read. */
  date: string;
  matches: Readonly<Record<string, PlutosportMatch>>;
};

export type BolPrices = {
  /** YYYY-MM-DD: when the API was read. */
  date: string;
  /** Current bol.com price per slug with a confirmed bol.com page. */
  prices: Readonly<Record<string, number>>;
};

/** Adds the Plutosport page to a stick that has a 'zeker' match. */
export function withPlutosport(product: Product, plutosport: PlutosportMatches): Product {
  const match = plutosport.matches[product.slug];
  return match ? { ...product, plutosportProductUrl: match.productUrl } : product;
}

export type HockeyCityStickMatch = {
  /** Product page on hockeycity.nl; the tracking link is built in src/lib/retailers.ts. */
  productUrl: string;
  /** 'naam': a 'zeker' name match; 'handmatig': confirmed by the owner (hockeyCityConfirmed.ts). */
  method: 'naam' | 'handmatig';
  /** Lowest price of a length in stock incl. btw (the page's price when its lengths could not be read). */
  priceEur: number;
  /** Lengths in inches in stock, from the product page. */
  lengths?: readonly number[];
};

export type HockeyCityOffers = {
  /** YYYY-MM-DD: when the feed was read. */
  date: string;
  /** Sticks with an in-stock HockeyCity page. */
  sticks: Readonly<Record<string, HockeyCityStickMatch>>;
  /** Shoe models (curated or imported) with a HockeyCity page of the same EAN. */
  shoes: Readonly<Record<string, ShoeListing>>;
};

/** Adds the HockeyCity page to a stick that has a confirmed match. */
export function withHockeyCity(product: Product, hockeyCity: HockeyCityOffers): Product {
  const match = hockeyCity.sticks[product.slug];
  return match ? { ...product, hockeyCityProductUrl: match.productUrl } : product;
}

/** A stick at Daka, like HockeyCityStickMatch; lengths and price come from the feed rows (one per length). */
export type DakaStickMatch = {
  /** Product page on daka.nl; the tracking link is built in src/lib/retailers.ts. */
  productUrl: string;
  /**
   * 'naam': a 'zeker' name match; 'naam-zonder-jaar': the same name and one candidate, only the model
   * year unknown (owner's decision, decision log 2026-11-04); 'handmatig': confirmed by the owner (dakaConfirmed.ts).
   */
  method: 'naam' | 'naam-zonder-jaar' | 'handmatig';
  /** Lowest price of a length in stock incl. btw (never the feed's price_old). */
  priceEur: number;
  /** Lengths in inches in stock. */
  lengths?: readonly number[];
};

export type DakaOffers = {
  /** YYYY-MM-DD: when the feed was read. */
  date: string;
  sticks: Readonly<Record<string, DakaStickMatch>>;
  /** Shoe models with a Daka page of the same EAN (the feed rarely has EANs). */
  shoes: Readonly<Record<string, ShoeListing>>;
};

/** Adds the Daka page to a stick that has a confirmed match. */
export function withDaka(product: Product, daka: DakaOffers): Product {
  const match = daka.sticks[product.slug];
  return match ? { ...product, dakaProductUrl: match.productUrl } : product;
}

const offer = (
  retailer: RetailerId,
  productUrl: string,
  priceEur: number | null,
  readAt: string,
  inStock: boolean,
  lengths?: readonly number[],
): Offer => ({
  retailer,
  productUrl,
  priceEur,
  shippingEur: priceEur === null ? null : shippingCostEur(SHIPPING[retailer], priceEur),
  inStock,
  ...(lengths && lengths.length > 0 && { lengths }),
  readAt: priceEur === null || !readAt ? null : readAt,
});

/**
 * Every partner shop that sells this stick, unsorted. Only confirmed pages
 * (rule 6 of the spec): bol.com with a bol.com product page, never a search;
 * Plutosport only with a 'zeker' match; HockeyCity with a 'zeker' or confirmed one.
 */
export function getOffers(product: Product): Offer[] {
  const offers: Offer[] = [];
  const { slug } = product;

  if (product.bolProductUrl && isSoldAtBol(product)) {
    // bol.com sells it when we know its page; the API gives no lengths.
    offers.push(offer('bolcom', product.bolProductUrl, BOL_PRICES.prices[slug] ?? null, BOL_PRICES.date, true));
  }

  if (product.passaSportsProductUrl) {
    if (product.feedImport?.feed === 'passahockey') {
      // Imported sticks are in stock by definition; price and lengths are PassaHockey's.
      offers.push(
        offer('passasports', product.passaSportsProductUrl, product.priceIndicativeEur.value, product.feedImport.importedAt, true, product.lengthsInches.value),
      );
    } else {
      // The weekly sync only lists a price for sticks in stock.
      const price = PASSAHOCKEY_LIVE_PRICES.prices[slug] ?? null;
      offers.push(
        offer('passasports', product.passaSportsProductUrl, price, PASSAHOCKEY_LIVE_PRICES.date, price !== null, PASSAHOCKEY_LIVE_PRICES.lengths?.[slug]),
      );
    }
  }

  if (product.plutosportProductUrl) {
    if (product.feedImport?.feed === 'plutosport') {
      offers.push(
        offer('plutosport', product.plutosportProductUrl, product.priceIndicativeEur.value, product.feedImport.importedAt, true, product.lengthsInches.value),
      );
    } else {
      const match = PLUTOSPORT_MATCHES.matches[slug];
      // Only in-stock pages are matched (scripts/plutosport-feed.ts).
      offers.push(offer('plutosport', product.plutosportProductUrl, match?.priceEur ?? null, PLUTOSPORT_MATCHES.date, true, match?.lengths));
    }
  }

  if (product.hockeyCityProductUrl) {
    if (product.feedImport?.feed === 'hockeycity') {
      offers.push(
        offer('hockeycity', product.hockeyCityProductUrl, product.priceIndicativeEur.value, product.feedImport.importedAt, true, product.lengthsInches.value),
      );
    } else {
      // Only in-stock pages are matched (scripts/hockeycity-feed.ts); lengths from the page when it could be read.
      const match = HOCKEYCITY_OFFERS.sticks[slug];
      offers.push(offer('hockeycity', product.hockeyCityProductUrl, match?.priceEur ?? null, HOCKEYCITY_OFFERS.date, true, match?.lengths));
    }
  }

  if (product.dakaProductUrl) {
    if (product.feedImport?.feed === 'daka') {
      offers.push(
        offer('daka', product.dakaProductUrl, product.priceIndicativeEur.value, product.feedImport.importedAt, true, product.lengthsInches.value),
      );
    } else {
      // Only in-stock pages are matched (scripts/daka-feed.ts); lengths from the feed rows.
      const match = DAKA_OFFERS.sticks[slug];
      offers.push(offer('daka', product.dakaProductUrl, match?.priceEur ?? null, DAKA_OFFERS.date, true, match?.lengths));
    }
  }
  return offers;
}
