/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // REQUIS pour le Dockerfile multi-stage : génère .next/standalone avec server.js autonome
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  // Autoriser les images depuis le backend et S3
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'http', hostname: 'backend', port: '3001' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
};

module.exports = nextConfig;
