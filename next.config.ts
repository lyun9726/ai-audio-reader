import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for file uploads (50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // This is the key setting for API routes body size
    middlewareClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
