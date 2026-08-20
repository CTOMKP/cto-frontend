import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
      {
        protocol: 'https',
        hostname: 'd2cjbd1iqkwr9j.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.ctomarketplace.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    // Privy API Configuration
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    
    // Backend Configuration
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_AUTH_API_BASE: process.env.NEXT_PUBLIC_AUTH_API_BASE,
    
    // CloudFront CDN Configuration
    NEXT_PUBLIC_CLOUDFRONT_DOMAIN: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN,
    
    // Panora API Configuration
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  },
};

export default nextConfig;
