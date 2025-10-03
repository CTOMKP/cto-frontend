import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  },
};

export default nextConfig;
