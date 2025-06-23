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
  // Remove static export for now to avoid complications
  // output: 'export',
  // trailingSlash: true,
  // distDir: 'out',
};

module.exports = nextConfig;