import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dd.dexscreener.com',
        port: '',
        pathname: '/ds-data/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/trustwallet/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dexscreener.com',
        port: '',
        pathname: '/cms/**',
      },
    ],
  },
  env: {
    // Circle API Configuration
    NEXT_PUBLIC_CIRCLE_APP_ID: process.env.NEXT_PUBLIC_CIRCLE_APP_ID,
    NEXT_PUBLIC_CIRCLE_API_KEY: process.env.NEXT_PUBLIC_CIRCLE_API_KEY,
    NEXT_PUBLIC_CIRCLE_API_BASE: process.env.NEXT_PUBLIC_CIRCLE_API_BASE,
    NEXT_PUBLIC_CIRCLE_ENVIRONMENT: process.env.NEXT_PUBLIC_CIRCLE_ENVIRONMENT,
    
    // Google OAuth Configuration
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    
    // Backend Configuration
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_AUTH_API_BASE: process.env.NEXT_PUBLIC_AUTH_API_BASE,
    
    // Panora API Configuration
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  },
};

export default nextConfig;
