import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'realestate-images-mumbai-sunrise.s3.ap-south-1.amazonaws.com',
    pathname: '/properties/**',
  },
  {
    protocol: 'https',
    hostname: 'realestate-images-mumbai-sunrise.s3.ap-south-1.amazonaws.com',
    pathname: '/user-properties/**',
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (apiUrl) {
  try {
    const url = new URL(apiUrl);

    remotePatterns.push({
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    });
  } catch {
    // Ignore malformed image host configuration and keep the default patterns.
  }
}

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/image-proxy',
      },
      {
        pathname: '/images/**',
      },
    ],
    remotePatterns,
  },
};

export default nextConfig;
