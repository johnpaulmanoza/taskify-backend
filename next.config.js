/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the 'output: export' setting to allow dynamic API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Disable static optimization for API routes
  experimental: {
    serverComponentsExternalPackages: ['sqlite3', 'bcryptjs']
  },
  // Add output: 'standalone' for Docker deployment
  output: 'standalone',
};

module.exports = nextConfig;