import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 에러 무시 (배포용)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
