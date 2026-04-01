/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // Disabled — Netlify handles Next.js natively
  outputFileTracingRoot: __dirname,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
