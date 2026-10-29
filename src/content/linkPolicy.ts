/**
 * Shops we cite as a source in an article, PassaHockey and Plutosport
 * included: a source link is not a shop button, so it stays visible but
 * carries `nofollow` and passes no ranking value to a shop. Shop buttons
 * themselves are partner links with `rel="sponsored"` (RetailerLink).
 * bol.com is not on the list: it was the only partner shop when the list was
 * made; whether it belongs here is an open choice (decision log 2026-10-29).
 * Manufacturers and rule bodies are followed normally.
 */
const NOFOLLOW_HOSTS = [
  'intersport.nl',
  'hockeydirect.nl',
  'hockeydirect.com',
  'passasports.nl',
  'plutosport.nl',
  'jumbosports.com',
  'de-hockeywinkel.nl',
];

function isNofollowHost(href: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(href).hostname;
  } catch {
    return false;
  }
  return NOFOLLOW_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

/** `rel` value for an outbound source link. */
export function sourceLinkRel(href: string): string {
  return isNofollowHost(href)
    ? 'noopener noreferrer nofollow'
    : 'noopener noreferrer';
}
