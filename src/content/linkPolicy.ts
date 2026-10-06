/**
 * Other shops we cite as a source. Links to them stay visible but carry
 * `nofollow`, so we do not pass ranking value to a competitor of our
 * partner shop. Manufacturers and rule bodies are followed normally.
 */
const NOFOLLOW_HOSTS = ['intersport.nl', 'hockeydirect.nl', 'hockeydirect.com'];

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
