import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
