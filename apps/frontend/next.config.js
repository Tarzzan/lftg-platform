/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mode standard (next start) — pas de standalone
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  },
  // Autoriser les origines de développement (proxy Manus)
  allowedDevOrigins: ["3000-iay9wjak2s7cop3098zgr-b3a7b794.us2.manus.computer"],
  // Autoriser les images depuis le backend et S3
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001" },
      { protocol: "http", hostname: "backend", port: "3001" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  // Headers de cache HTTP pour les assets statiques
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  // Compression
  compress: true,
  // Optimisation des polices
  optimizeFonts: true,
};
module.exports = nextConfig;
