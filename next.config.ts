import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for file uploads (50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // API route config
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default nextConfig;
