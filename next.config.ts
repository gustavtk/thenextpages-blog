import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.thenextpages.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.thenextpages.com',
        pathname: '/**',
      },
      // Add support for common WordPress media subdomains
      {
        protocol: 'https',
        hostname: '*.thenextpages.com',
        pathname: '/**',
      },
      // Add support for WordPress.com hosted images if needed
      {
        protocol: 'https',
        hostname: '*.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wordpress.com',
        pathname: '/**',
      }
    ],
    // Allow optimization for external images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
