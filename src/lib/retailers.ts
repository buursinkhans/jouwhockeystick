import type { Brand } from '@/catalog/types';

export type RetailerId = 'bolcom';

/** Where on the site a shop link sits; sent as bol.com sub-ID to see which pages convert. */
export type RetailerPlacement =
  'stickwijzer' | 'productpagina' | 'catalogus' | 'vergelijk';

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

export type Retailer = {
  id: RetailerId;
  label: string;
  /** Returns null when this retailer has no verified link for the given brand. */
  getUrl: (params: {
    productName: string;
    brand: Brand;
    placement: RetailerPlacement;
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
    getUrl: ({ productName, placement }) => {
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
};
