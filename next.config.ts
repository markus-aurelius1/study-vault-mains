import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: { '/**': ['./content/**/*.json'] },
};

export default nextConfig;
