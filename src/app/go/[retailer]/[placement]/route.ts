import { isBot } from '@/lib/botDetect';
import { isPlacement, isRetailerId, resolveGo } from '@/lib/goLink';

/**
 * /go/<shop>/<placement>?r=<path>: the page every shop button links to
 * (decision log 2026-11-24). A browser gets a 302 to the partner link, exactly
 * the one the button used to carry; a bot gets a 403 without a Location, so it
 * never reaches the partner. Unknown shop, place, path or kind: 404.
 *
 * Always dynamic and never cached: a CDN that kept a 403 or a 302 for a URL
 * would hand it to the next visitor, bot or not. No cookies, no body, no
 * personal data are read or written; the user-agent is only looked at.
 */
export const dynamic = 'force-dynamic';

const HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

const reply = (status: number, extra: Record<string, string> = {}) =>
  new Response(null, { status, headers: { ...HEADERS, ...extra } });

export async function GET(request: Request, { params }: { params: Promise<{ retailer: string; placement: string }> }) {
  const { retailer, placement } = await params;
  if (!isRetailerId(retailer) || !isPlacement(placement)) return reply(404);

  // Bots: refused, not redirected. The user-agent is the only signal (owner, 2026-11-24).
  if (isBot(request.headers.get('user-agent'))) return reply(403);

  const query = new URL(request.url).searchParams;
  const target = resolveGo(retailer, placement, { r: query.get('r'), n: query.get('n'), k: query.get('k') });
  if (!target) return reply(404);

  return reply(302, { Location: target });
}

/** A prefetcher or link checker asking with HEAD must never be sent on: it gets a 405. */
export function HEAD() {
  return reply(405, { Allow: 'GET' });
}
