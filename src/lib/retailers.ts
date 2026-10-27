import type { Brand } from '@/catalog/types';

export type RetailerId = 'bolcom' | 'passasports' | 'plutosport';

/** Where on the site a shop link sits; sent as bol.com sub-ID to see which pages convert. */
export type RetailerPlacement =
  'stickwijzer' | 'productpagina' | 'catalogus' | 'vergelijk' | 'zaalkeuze';

/**
 * bol.com Partnerprogramma site ID of jouwhockeystick.nl. Not a secret — it is
 * part of every partner link. Can be overridden per environment (e.g. a test
 * site) with NEXT_PUBLIC_BOL_PARTNER_SITE_ID.
 */
export const BOL_PARTNER_SITE_ID =
  process.env.NEXT_PUBLIC_BOL_PARTNER_SITE_ID ?? '1547833';

/**
 * Wraps a bol.com URL in a Partnerprogramma tracking link (text-link format:
 * partner.bol.com/click/click?t=url&s=…&url=…&f=TXL&subid=…&name=…).
 * The tracking link is the only source of truth for attribution; nothing
 * about commission is assumed or shown in the UI.
 */
export function bolPartnerUrl(
  targetUrl: string,
  { subid, name }: { subid: string; name: string },
): string {
  if (!BOL_PARTNER_SITE_ID) {
    return targetUrl;
  }
  const params = new URLSearchParams({
    t: 'url',
    s: BOL_PARTNER_SITE_ID,
    url: targetUrl,
    f: 'TXL',
    subid,
    name,
  });
  return `https://partner.bol.com/click/click?${params.toString()}`;
}

/**
 * PassaSports affiliate programme via TradeTracker (campaign "Passasports.nl",
 * deeplinking and reference tracking). Not secrets — they are part of every
 * tracking link. Format taken from a link generated in the TradeTracker
 * dashboard on 2026-10-16:
 * passasports.nl/tt/passa-nl/?tt=<campaign>_<material>_<site>_<reference>&r=<path>
 */
export const PASSASPORTS_TRADETRACKER = {
  campaignId: '39608',
  materialId: '12',
  affiliateSiteId: '517408',
} as const;

/**
 * Wraps a PassaSports product URL in a TradeTracker direct-link. The
 * reference (where on our site the link sits) shows up in TradeTracker's
 * reports; it may not contain "_", the separator inside `tt`.
 */
export function passaSportsTrackingUrl(
  productUrl: string,
  reference: string,
): string | null {
  let target: URL;
  try {
    target = new URL(productUrl);
  } catch {
    return null;
  }
  if (target.hostname !== 'www.passasports.nl') {
    return null;
  }
  const { campaignId, materialId, affiliateSiteId } = PASSASPORTS_TRADETRACKER;
  const params = new URLSearchParams({
    tt: [
      campaignId,
      materialId,
      affiliateSiteId,
      reference.replaceAll('_', '-'),
    ].join('_'),
    r: `${target.pathname}${target.search}`,
  });
  return `https://www.passasports.nl/tt/passa-nl/?${params.toString()}`;
}

/**
 * Plutosport NL affiliate programme via Awin. Not secrets: both IDs are part
 * of every tracking link.
 */
export const PLUTOSPORT_AWIN = {
  advertiserId: '8342',
  publisherId: '3132918',
} as const;

/** Product pages only: no search, category or other pages, no query string. */
export function isPlutosportProductPage(url: URL): boolean {
  return (
    /^(www\.)?plutosport\.nl$/i.test(url.hostname) &&
    url.protocol === 'https:' &&
    url.search === '' &&
    url.pathname.length > 1 &&
    !/^\/(catalogsearch|zoeken|search|klantenservice|checkout|customer)(\/|$)/i.test(url.pathname)
  );
}

/**
 * Wraps a Plutosport product page in an Awin deep link (cread.php). The
 * place on our site goes in `clickref`, which Awin documents for cread.php
 * links and reports back per click. We do not use the feed's pclick.php link:
 * Awin's documentation does not say that clickref works there (decision log
 * 2026-10-27). Awin does not accept "&", "#" or "+" in a clickref.
 */
export function plutosportTrackingUrl(
  productUrl: string,
  placement: string,
): string | null {
  let target: URL;
  try {
    target = new URL(productUrl);
  } catch {
    return null;
  }
  if (!isPlutosportProductPage(target)) {
    return null;
  }
  const params = new URLSearchParams({
    awinmid: PLUTOSPORT_AWIN.advertiserId,
    awinaffid: PLUTOSPORT_AWIN.publisherId,
    clickref: placement.replace(/[&#+]/g, '-'),
    ued: target.toString(),
  });
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Shipping for one stick, from the shop's public delivery terms, until a feed
 * states it (docs/spec/prijsvergelijking.md §7.1). `costEur: null` means
 * unknown, and the site then says so.
 */
export type ShippingTerms = {
  costEur: number | null;
  /** Free shipping from this order value; null when the shop has no threshold. */
  freeFromEur: number | null;
  sourceUrl: string;
  checkedAt: string;
  note: string;
};

/** Plutosport has no delivery_cost in its Awin feed. */
export const PLUTOSPORT_SHIPPING: ShippingTerms = {
  costEur: 6.95,
  freeFromEur: 75,
  sourceUrl: 'https://www.plutosport.nl/bezorgen-afhalen',
  checkedAt: '2026-10-26',
  note: 'Laagste tarief in Nederland (bezorgen bij een DHL ServicePoint); overdag thuisbezorgen kost €7,95, \'s avonds €8,95.',
};

/** Shipping for an order of one item at this price; null when unknown. */
export function shippingCostEur(terms: ShippingTerms, priceEur: number): number | null {
  if (terms.freeFromEur !== null && priceEur >= terms.freeFromEur) return 0;
  return terms.costEur;
}

export type Retailer = {
  id: RetailerId;
  label: string;
  /** Returns null when this retailer has no verified link for the given brand. */
  getUrl: (params: {
    productName: string;
    brand: Brand;
    placement: RetailerPlacement;
    /** Direct product page at this retailer; without it the link is a search. */
    productUrl?: string;
  }) => string | null;
};

export const RETAILERS: Record<RetailerId, Retailer> = {
  bolcom: {
    id: 'bolcom',
    label: 'bol.com',
    // Always appends "hockeystick" to the search text: a bare model name
    // (e.g. "JDH X93 Pro Bow") can otherwise match unrelated bol.com
    // products such as headphones, since bol.com's search matches on loose
    // word overlap.
    getUrl: ({ productName, placement, productUrl }) => {
      if (productUrl) {
        return bolPartnerUrl(productUrl, {
          subid: placement,
          name: productName,
        });
      }
      const params = new URLSearchParams({
        searchtext: `${productName} hockeystick`,
      });
      return bolPartnerUrl(
        `https://www.bol.com/nl/nl/s/?${params.toString()}`,
        {
          subid: placement,
          name: productName,
        },
      );
    },
  },
  passasports: {
    id: 'passasports',
    label: 'PassaHockey',
    // Only direct product links: we never send people to a PassaSports search.
    getUrl: ({ placement, productUrl }) =>
      productUrl ? passaSportsTrackingUrl(productUrl, placement) : null,
  },
  plutosport: {
    id: 'plutosport',
    label: 'Plutosport',
    // Only direct product links, like PassaHockey: never a Plutosport search.
    getUrl: ({ placement, productUrl }) =>
      productUrl ? plutosportTrackingUrl(productUrl, placement) : null,
  },
};
