import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Netlify configuration
  images: {
    formats: ['image/webp'],
  },

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_DEFAULT_WINDOW_HOURS: process.env.LAST_MINUTE_WINDOW_HOURS || '72',
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
