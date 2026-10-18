/**
 * Pure helpers for the monthly Instagram token refresh
 * (scripts/instagram-token-refresh.ts). Kept free of network calls so they
 * can be tested; the token itself is never logged.
 */

export const INSTAGRAM_TOKEN_KEY = 'INSTAGRAM_ACCESS_TOKEN';

/** One value of a Netlify environment variable, per deploy context. */
export type NetlifyEnvValue = { context: string; value: string };

/**
 * The value the live site uses: the production one, else the one shared by
 * all contexts. Branch or preview values are never picked.
 */
export function liveEnvValue(
  values: NetlifyEnvValue[],
): NetlifyEnvValue | null {
  return (
    values.find((v) => v.context === 'production') ??
    values.find((v) => v.context === 'all') ??
    null
  );
}

export type RefreshResponse = {
  access_token?: unknown;
  expires_in?: unknown;
  error?: { message?: unknown };
};

/** A refreshed long-lived token, or why the refresh failed (without the token). */
export function parseRefresh(
  status: number,
  body: RefreshResponse,
): { token: string; expiresInDays: number } | { error: string } {
  if (
    status === 200 &&
    typeof body.access_token === 'string' &&
    body.access_token.length > 20 &&
    typeof body.expires_in === 'number'
  ) {
    return {
      token: body.access_token,
      expiresInDays: Math.floor(body.expires_in / 86_400),
    };
  }
  const message =
    typeof body.error?.message === 'string' ? body.error.message : 'onbekend';
  return { error: `Instagram gaf HTTP ${status}: ${message}` };
}
