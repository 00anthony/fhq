import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.pravatar.cc"], // ✅ Allow pravatar images
  },
};

export default nextConfig;
