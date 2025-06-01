import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during build (for generated Prisma files)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build if needed
  typescript: {
    ignoreBuildErrors: false, // Set to true only if you have persistent TS errors
  },
  
  // Image optimization for Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Experimental features for Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Optional: Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Optional: Redirects if needed
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },
  
  // Optional: Headers configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;