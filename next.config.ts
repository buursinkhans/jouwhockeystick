import type { NextConfig } from 'next';

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
