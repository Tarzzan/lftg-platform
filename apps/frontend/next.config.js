/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mode standard (next start) — pas de standalone
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  // Autoriser les origines de développement (proxy Manus)
  allowedDevOrigins: ['3000-iay9wjak2s7cop3098zgr-b3a7b794.us2.manus.computer'],
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
