import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // TypeScript configuration
  typescript: {
    // Only ignore build errors if absolutely necessary
    ignoreBuildErrors: false,
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CHAMANA',
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['@/components', '@/lib'],
  },
};

export default nextConfig;
