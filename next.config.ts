import type { NextConfig } from 'next';
import {
  POSTHOG_ASSETS_ORIGIN,
  POSTHOG_INGEST_ORIGIN,
  POSTHOG_PROXY_PATH,
} from './src/lib/analytics/posthog';

/**
 * Security headers for every page (security check 2026-10-21). Kept
 * deliberately small so nothing breaks: no full Content-Security-Policy yet
 * (the analytics scripts and Next.js inline scripts would need a nonce
 * setup), only the frame rule, which stops other sites from showing ours in
 * a frame (clickjacking). HSTS and nosniff are already set by Netlify.
 */
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  // PostHog's API paths end in a slash (/e/, /flags/); without this every
  // measurement would get a 308 first. Pages keep their redirect from
  // "/page/" to "/page" through the explicit redirect below.
  skipTrailingSlashRedirect: true,
  // Reverse proxy for PostHog (decision log 2026-10-26), as in PostHog's
  // Next.js guide for the EU region. The request headers are passed on as
  // they are, so PostHog still gets the visitor's IP from X-Forwarded-For,
  // which its cookieless mode needs to count unique visitors per day.
  async rewrites() {
    return [
      {
        source: `${POSTHOG_PROXY_PATH}/static/:path*`,
        destination: `${POSTHOG_ASSETS_ORIGIN}/static/:path*`,
      },
      {
        source: `${POSTHOG_PROXY_PATH}/array/:path*`,
        destination: `${POSTHOG_ASSETS_ORIGIN}/array/:path*`,
      },
      {
        source: `${POSTHOG_PROXY_PATH}/:path*`,
        destination: `${POSTHOG_INGEST_ORIGIN}/:path*`,
      },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  images: {
    // Instagram post images (see src/lib/instagram.ts), served through the
    // site's own image optimiser so visitors never load them from Meta.
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
  async redirects() {
    return [
      // What Next.js did by itself before skipTrailingSlashRedirect: one URL
      // per page, "/kennis/" → "/kennis". Not for the PostHog proxy path.
      {
        source: `/:path((?!${POSTHOG_PROXY_PATH.slice(1)}(?:/|$)).+)/`,
        destination: '/:path',
        permanent: true,
      },
      // Short address for the TikTok bio, which has no clickable link on a
      // personal account. The UTM tags let PostHog attribute these visits.
      // Temporary (307) so the destination can change after the test.
      {
        source: '/tiktok',
        destination:
          '/stickwijzer?utm_source=tiktok&utm_medium=social&utm_campaign=bio',
        permanent: false,
      },
      // Short address shown in YouTube descriptions and on the channel page
      // (docs/video.md). Temporary (307), like /tiktok.
      {
        source: '/youtube',
        destination:
          '/stickwijzer?utm_source=youtube&utm_medium=video&utm_campaign=kanaal',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
