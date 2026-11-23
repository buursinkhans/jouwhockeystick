import {
  RETAILERS,
  RETAILER_PLACEMENTS,
  shopPageTrackingUrl,
  type RetailerId,
  type RetailerPlacement,
} from './retailers';

/**
 * The redirect /go/<shop>/<placement> (decision log 2026-11-24): every shop
 * button links to our own route first, which sends a browser on to the partner
 * link and refuses bots, so bots do not click affiliate links. This file builds
 * the button's URL and reads it back; the route is src/app/go/.
 *
 * The shop's host is fixed here per shop and never taken from the URL, so the
 * route cannot be made to redirect anywhere else. The route does not build the
 * partner link itself: it calls the same `RETAILERS[shop].getUrl` (and
 * `shopPageTrackingUrl` for action pages) as before, with the shop page
 * rebuilt from the host and the path, so the partner link stays byte for byte
 * the same.
 */

/** The one host per shop that a /go/ link may lead to. */
export const GO_SHOP_HOSTS: Readonly<Record<RetailerId, string>> = {
  bolcom: 'www.bol.com',
  passasports: 'www.passasports.nl',
  plutosport: 'www.plutosport.nl',
  hockeycity: 'www.hockeycity.nl',
  daka: 'www.daka.nl',
};

export const GO_PATH_PREFIX = '/go';

/** A path (with query) on the shop's host; long enough for every shop page we know, short enough to refuse abuse. */
export const GO_MAX_PATH_LENGTH = 1500;
export const GO_MAX_NAME_LENGTH = 200;

export function isRetailerId(value: string): value is RetailerId {
  return Object.prototype.hasOwnProperty.call(GO_SHOP_HOSTS, value);
}

export function isPlacement(value: string): value is RetailerPlacement {
  return (RETAILER_PLACEMENTS as readonly string[]).includes(value);
}

/** What a /go/ link leads to: a product page, or a shop's own action page (/black-friday-hockey). */
export type GoKind = 'product' | 'actie';

/** The path and query of `pageUrl` on the shop's own host, or null for any other host or a malformed URL. */
export function shopPath(retailer: RetailerId, pageUrl: string): string | null {
  const prefix = `https://${GO_SHOP_HOSTS[retailer]}`;
  // Plain prefix on the raw string: the partner link must contain the page exactly as the catalog has it.
  if (!pageUrl.startsWith(`${prefix}/`) && pageUrl !== prefix) return null;
  const rest = pageUrl.slice(prefix.length) || '/';
  if (rest.length > GO_MAX_PATH_LENGTH || /[\s\\]/.test(rest)) return null;
  return rest;
}

/** `/go/<shop>/<placement>?r=<path>`, with the product name for bol.com and `k=actie` for an action page. */
export function goUrl(params: {
  retailer: RetailerId;
  placement: RetailerPlacement;
  pageUrl: string;
  /** bol.com puts the product name in its partner link (`name`). */
  productName?: string;
  kind?: GoKind;
}): string | null {
  const path = shopPath(params.retailer, params.pageUrl);
  if (path === null) return null;
  const query = new URLSearchParams({ r: path });
  if (params.kind === 'actie') query.set('k', 'actie');
  else if (params.retailer === 'bolcom' && params.productName) query.set('n', params.productName.slice(0, GO_MAX_NAME_LENGTH));
  return `${GO_PATH_PREFIX}/${params.retailer}/${params.placement}?${query.toString()}`;
}

/**
 * The href of a shop button for a product. Null when the shop has no verified
 * link (the button stays away, as before). Without a product page the
 * bol.com search link stays direct (owner decision 2026-11-24: no place on the
 * site uses it).
 */
export function retailerHref(params: {
  retailer: RetailerId;
  brand: string;
  productName: string;
  placement: RetailerPlacement;
  productUrl?: string;
}): string | null {
  const direct = RETAILERS[params.retailer].getUrl(params);
  if (!direct || !params.productUrl) return direct;
  // A product page on another host than the shop's own never goes through /go/: it keeps working as before.
  return (
    goUrl({
      retailer: params.retailer,
      placement: params.placement,
      pageUrl: params.productUrl,
      productName: params.productName,
    }) ?? direct
  );
}

/** The href of a button to a shop's action page; null when the page is not on the shop's domain. */
export function promoHref(retailer: RetailerId, pageUrl: string, placement: RetailerPlacement): string | null {
  const direct = shopPageTrackingUrl(retailer, pageUrl, placement);
  if (!direct) return null;
  return goUrl({ retailer, placement, pageUrl, kind: 'actie' }) ?? direct;
}

/**
 * The partner link a /go/ request leads to, or null for anything that is not
 * a valid link (the route then answers 404). `shop` and `placement` come from the path of the request, `r`, `n`
 * and `k` from its query.
 */
export function resolveGo(
  shop: string,
  placement: string,
  query: { r: string | null; n: string | null; k: string | null },
): string | null {
  if (!isRetailerId(shop) || !isPlacement(placement)) return null;
  const path = query.r;
  if (!path || path.length > GO_MAX_PATH_LENGTH || !path.startsWith('/') || /[\s\\]/.test(path)) return null;
  const host = GO_SHOP_HOSTS[shop];
  const pageUrl = `https://${host}${path}`;
  // The rebuilt URL must still be on the shop's host: no way out through the path.
  try {
    const parsed = new URL(pageUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== host || parsed.username || parsed.password || parsed.port) return null;
  } catch {
    return null;
  }
  if (query.k === 'actie') return shopPageTrackingUrl(shop, pageUrl, placement);
  if (query.k !== null && query.k !== '') return null;
  return RETAILERS[shop].getUrl({
    productName: (query.n ?? '').slice(0, GO_MAX_NAME_LENGTH),
    brand: '',
    placement,
    productUrl: pageUrl,
  });
}
