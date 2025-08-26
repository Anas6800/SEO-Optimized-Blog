import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_WP_API_BASE
      ? [
          {
            protocol: process.env.NEXT_PUBLIC_WP_API_BASE.startsWith("https") ? "https" : "http",
            hostname: new URL(process.env.NEXT_PUBLIC_WP_API_BASE).hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
