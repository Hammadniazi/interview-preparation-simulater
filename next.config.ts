import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize package imports for better performance
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
