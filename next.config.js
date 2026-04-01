/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
