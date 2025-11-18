/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
