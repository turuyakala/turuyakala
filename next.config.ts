import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/webp'],
  },

  // Environment variables available to the client
  env: {
    DEFAULT_WINDOW_HOURS: process.env.LAST_MINUTE_WINDOW_HOURS || '72',
  },

  // Redirects for cleaner URLs
  async redirects() {
    return [
      // You can add redirects here if needed
    ];
  },

  // Disable ESLint during build for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
