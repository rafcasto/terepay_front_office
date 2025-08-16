import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
  },
  // Enable production source maps for better debugging
  productionBrowserSourceMaps: true,
  // Enable compression
  compress: true,
  // Enable React strict mode for better development practices
  reactStrictMode: true,
  // Configure compiler options for better performance
  compiler: {
    // Enable removal of console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
