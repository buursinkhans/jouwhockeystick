/**
 * Content-Security-Policy in report-only mode (security review 2026-11-13).
 * The browser enforces nothing and reports a violation in the console only
 * (no report-uri: the owner reads the console). The enforced header stays
 * `frame-ancestors 'self'` (next.config.ts) until this policy has run without
 * console reports for a while.
 *
 * What the site loads, and why each source is here:
 * - Next.js: scripts and styles from the own domain, plus inline scripts and
 *   style attributes (no nonce: a nonce would make every page dynamic).
 * - Simple Analytics (src/app/layout.tsx): the script from
 *   scripts.simpleanalyticscdn.com, events to queue.simpleanalyticscdn.com.
 * - PostHog: through the own proxy path (/p8k, see posthog.ts), so 'self'.
 * - Images: product photos come from many shops and brands (bol.com,
 *   PassaHockey, Daka, brand sites), so any https image is allowed.
 * - Netlify Forms: the interest form posts to the own domain.
 * - Fonts: next/font serves them from the own domain.
 */

export const SIMPLE_ANALYTICS_SCRIPT_ORIGIN = 'https://scripts.simpleanalyticscdn.com';
export const SIMPLE_ANALYTICS_QUEUE_ORIGIN = 'https://queue.simpleanalyticscdn.com';

export function contentSecurityPolicy({ dev = false }: { dev?: boolean } = {}): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // 'unsafe-eval' only in development: React's dev tools need it.
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), SIMPLE_ANALYTICS_SCRIPT_ORIGIN],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", SIMPLE_ANALYTICS_QUEUE_ORIGIN, ...(dev ? ['ws:'] : [])],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}
