import { NextResponse, type NextRequest } from 'next/server';
import { collapseSlashes } from '@/lib/slashes';

/**
 * Redirects (308) a path with repeated slashes to the same path with single
 * slashes, query string kept. On Netlify this runs as an Edge Function before
 * the CDN cache, which otherwise serves "//stickwijzer" as a normal page and
 * crashes the router in the browser (decision log 2026-10-24). The matcher
 * only lets such paths through, so normal requests never reach this code.
 */
export function proxy(request: NextRequest) {
  const fixed = collapseSlashes(request.nextUrl.pathname);
  if (!fixed) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = fixed;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Only paths that start with "//" or contain "//" further on.
  matcher: ['/(/.*)', '/(.*//.*)'],
};
