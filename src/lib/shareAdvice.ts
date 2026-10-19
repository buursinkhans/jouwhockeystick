/**
 * "Deel dit advies": the advice travels in the link itself, so nothing is
 * stored on our side. The link holds the stickwijzer answers (no name or
 * contact details) and the slugs of the sticks that were advised; the shared
 * page recalculates the advice with current prices and stock and says what
 * changed since it was shared. Works in the browser and on the server.
 */

export const SHARE_PATH = '/stickwijzer/advies';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** The path and query of a share link, e.g. `/stickwijzer/advies?a=…&s=…`. */
export function shareHref(answers: object, slugs: readonly string[]): string {
  const params = new URLSearchParams({
    a: toBase64Url(JSON.stringify(answers)),
  });
  if (slugs.length) params.set('s', slugs.join(','));
  return `${SHARE_PATH}?${params.toString()}`;
}

/** Reads a share link; the answers still have to be validated by the caller. */
export function readShare(params: {
  a?: string | string[];
  s?: string | string[];
}): { answers: unknown; slugs: string[] } | null {
  const a = Array.isArray(params.a) ? params.a[0] : params.a;
  if (!a || a.length > 4000) return null;
  const json = fromBase64Url(a);
  if (json === null) return null;
  let answers: unknown;
  try {
    answers = JSON.parse(json);
  } catch {
    return null;
  }
  const s = Array.isArray(params.s) ? params.s[0] : params.s;
  const slugs = (s ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter((slug) => /^[a-z0-9-]{1,120}$/.test(slug))
    .slice(0, 5);
  return { answers, slugs };
}

export type ShareChange = {
  slug: string;
  name: string | null;
  available: boolean;
};

/**
 * Sticks that were advised when the link was shared but are not in today's
 * advice. `available` is false when the stick is no longer sold (not found).
 */
export function changesSinceShared(
  sharedSlugs: readonly string[],
  currentSlugs: readonly string[],
  lookup: (slug: string) => { name: string } | undefined,
): ShareChange[] {
  return sharedSlugs
    .filter((slug) => !currentSlugs.includes(slug))
    .map((slug) => {
      const product = lookup(slug);
      return {
        slug,
        name: product?.name ?? null,
        available: product !== undefined,
      };
    });
}
