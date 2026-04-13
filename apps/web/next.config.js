const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@carone/ui', '@carone/types'],
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.56.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'caroneapi-production.up.railway.app' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
