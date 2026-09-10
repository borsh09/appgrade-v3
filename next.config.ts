import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.APPGRADE_BUILD_DIR || '.next',
  poweredByHeader: false,
  images: {
    qualities: [75, 90, 100],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};

export default nextConfig;
