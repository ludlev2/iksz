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
  // Remove static export for now to avoid complications
  // output: 'export',
  // trailingSlash: true,
  // distDir: 'out',
};

module.exports = nextConfig;
