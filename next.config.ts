import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {},
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['pdf-parse', 'mammoth', 'pdfjs-dist'],
};

export default nextConfig;
