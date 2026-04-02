import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.auth0.com",
      },
    ],
  },
};

export default nextConfig;
