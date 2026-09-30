import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.APPGRADE_BUILD_DIR || '.next',
  poweredByHeader: false,
  images: {
    qualities: [75, 90, 100],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    if (process.env.APP_ORIGIN?.startsWith('https://')) {
      securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    }
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default nextConfig;
