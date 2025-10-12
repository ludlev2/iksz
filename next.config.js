/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@supabase\/storage-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Remove static export for now to avoid complications
  // output: 'export',
  // trailingSlash: true,
  // distDir: 'out',
};

module.exports = nextConfig;
