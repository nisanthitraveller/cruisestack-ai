import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd()
  },
  images: {
    // YouTube video thumbnails for the Academy chapter cards
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")]
  }
};

export default nextConfig;
