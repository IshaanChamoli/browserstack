import type { NextConfig } from "next";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-de080.up.railway.app';
const API_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
