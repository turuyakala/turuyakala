/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel compatibility
  // Vercel handles deployment automatically
  // output: 'standalone',
  // Production optimizations (compress is default in Next.js 15)
  compress: true,
  // Silence the lockfile warning by setting outputFileTracingRoot
  outputFileTracingRoot: path.join(__dirname),
  // ESLint configuration for production builds
  // Note: ESLint warnings are set to 'warn' level in eslint.config.mjs
  // but Next.js may still treat some warnings as errors during builds
  eslint: {
    // Ignore ESLint during builds to prevent build failures
    // ESLint will still run in development and CI/CD
    ignoreDuringBuilds: true,
  },
  // TypeScript configuration
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors. Only use this if you're sure you want to.
    ignoreBuildErrors: false,
  },
  // Experimental features
  experimental: {
    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
