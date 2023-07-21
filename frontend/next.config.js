/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    const { dir, defaultLoaders } = options;
    
    config.module.rules.push({
      test: /\.tsx?$/,
      include: [dir, /umbra\/umbra-js\/src/],
      exclude: /node_modules/,
      use: [defaultLoaders.babel],
    });
    
    return config;
  },
}

module.exports = nextConfig
