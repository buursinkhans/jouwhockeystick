export const dynamic = 'force-static';

/**
 * The commit this build was made from (Netlify sets COMMIT_REF while
 * building). The IndexNow workflow waits until this shows its own commit, so
 * it only notifies search engines once the new version is live
 * (decision log 2026-10-24). The repository is public, so this reveals nothing.
 */
export function GET() {
  return new Response(`${process.env.COMMIT_REF ?? 'lokaal'}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
