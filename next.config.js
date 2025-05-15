/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/webcastlemain',
  images: {
    unoptimized: true
  },
  // This config is required for GitHub Pages
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'out',
};

module.exports = nextConfig; 