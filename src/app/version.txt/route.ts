export const dynamic = 'force-static';

/**
 * Line 1: the commit this build was made from (Netlify sets COMMIT_REF while
 * building). The IndexNow workflow waits until it shows its own commit, so it
 * only notifies search engines once the new version is live (decision log
 * 2026-10-24). Line 2: when this build ran (ISO 8601, UTC). The daily
 * publication workflow rebuilds when it is more than 10 days old, so shop
 * prices on the static pages never pass the 14-day limit (decision log
 * 2026-11-08). Readers take only the line they need. The repository is
 * public, so this reveals nothing.
 */
export function GET() {
  return new Response(`${process.env.COMMIT_REF ?? 'lokaal'}\n${new Date().toISOString()}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
