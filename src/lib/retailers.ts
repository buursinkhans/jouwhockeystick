import type { Brand } from '@/catalog/types';

export type RetailerId = 'bolcom' | 'passasports';

/**
 * PassaSports links to a brand's category page (not a specific product —
 * we have no confirmed per-product PassaSports URLs), so we only enable it
 * for brands where that category page URL has actually been verified.
 * Never guess a slug for an unconfirmed brand. passasports.nl blocks direct
 * automated page loads (403), so these were confirmed via search-engine
 * indexed page titles rather than a live render — JDH in particular does
 * NOT follow the otherwise-consistent /hockey/hockeysticks/{brand} pattern.
 */
const PASSASPORTS_BRAND_SLUGS: Partial<Record<Brand, string>> = {
  Brabo: 'brabo',
  adidas: 'adidas',
  Grays: 'grays',
  Princess: 'princess',
  JDH: 'jamie_dwyer_hockey',
};

export type Retailer = {
  id: RetailerId;
  label: string;
  /** Returns null when this retailer has no verified link for the given brand. */
  getUrl: (params: { productName: string; brand: Brand }) => string | null;
};

export const RETAILERS: Record<RetailerId, Retailer> = {
  bolcom: {
    id: 'bolcom',
    label: 'bol.com',
    // Not a real affiliate/tracking link yet — no bol.com Partnerprogramma
    // account exists. Once there is one, add its tracking parameter here
    // (e.g. from an env var) rather than hardcoding one now.
    // Always appends "hockeystick" to the search text: a bare model name
    // (e.g. "JDH X93 Pro Bow") can otherwise match unrelated bol.com
    // products such as headphones, since bol.com's search matches on loose
    // word overlap.
    getUrl: ({ productName }) => {
      const params = new URLSearchParams({
        searchtext: `${productName} hockeystick`,
      });
      return `https://www.bol.com/nl/nl/s/?${params.toString()}`;
    },
  },
  passasports: {
    id: 'passasports',
    label: 'PassaSports',
    // PassaSports runs a real, active affiliate program via the TradeTracker
    // network — but we don't have an approved publisher account yet. This
    // is a plain category link, not a tracking link. Once approved on
    // TradeTracker, replace this with a real TradeTracker deeplink.
    getUrl: ({ brand }) => {
      const slug = PASSASPORTS_BRAND_SLUGS[brand];
      return slug
        ? `https://www.passasports.nl/hockey/hockeysticks/${slug}`
        : null;
    },
  },
};
