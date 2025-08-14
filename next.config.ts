import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_MAX_REQUESTS_PER_DAY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
};

export default nextConfig;
