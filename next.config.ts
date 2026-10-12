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
};

export default nextConfig;
