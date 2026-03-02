import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output untuk deployment VPS (Docker, PM2, dll)
  output: "standalone",

  // Allow Next.js Image Optimization for uploaded files in public/uploads/
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },

  // Rewrite /uploads/* to API route so old photo URLs in DB still work
  async rewrites() {
    return [
      {
        source: "/uploads/:filename",
        destination: "/api/uploads/:filename",
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
