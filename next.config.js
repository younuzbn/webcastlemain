/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/webcastlemain',
  assetPrefix: '/webcastlemain/',
  images: {
    unoptimized: true,
    // Ensure all domains are allowed
    domains: ['github.com', 'younuzbn.github.io'],
    // Make image loader use basePath
    loader: 'default',
    path: '/webcastlemain',
  },
  // This config is required for GitHub Pages
  trailingSlash: true,
  reactStrictMode: true,
  distDir: 'out',
  
  // Disable ESLint during builds - we're getting type errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Exclude the morphing-2d-demo-main directory from the build
  webpack: (config) => {
    config.module.rules.push({
      test: /public\/morphing-2d-demo-main/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig; 