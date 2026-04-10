/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@carone/ui', '@carone/types'],
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.56.1'],
};

module.exports = nextConfig;
