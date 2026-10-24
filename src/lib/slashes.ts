/**
 * A path with two or more slashes in a row ("//stickwijzer") is collapsed to
 * single slashes. On Netlify the CDN serves the cached page for such a path,
 * and the Next.js router in the browser then reads "//stickwijzer" as the
 * host "stickwijzer" and crashes (decision log 2026-10-24).
 * Returns null when the path is already fine.
 */
export function collapseSlashes(pathname: string): string | null {
  return /\/{2,}/.test(pathname) ? pathname.replace(/\/{2,}/g, '/') : null;
}
