/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/webcastlemain',
  assetPrefix: '/webcastlemain/',
  images: {
    unoptimized: true
  },
  // This config is required for GitHub Pages
  trailingSlash: true,
  reactStrictMode: true,
  distDir: 'out',
  
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