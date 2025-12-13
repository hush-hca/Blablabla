/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Server Components에서 특정 패키지를 외부화하여 번들에서 제외
  serverComponentsExternalPackages: [
    'pino',
    'pino-pretty',
    'thread-stream',
  ],
  // Webpack 설정으로 테스트 파일 제외
  webpack: (config, { isServer }) => {
    // thread-stream의 테스트 파일들을 무시
    config.plugins = config.plugins || [];
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^thread-stream\/test/,
      })
    );
    
    // 테스트 파일 경로를 무시하도록 alias 설정
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      // 테스트 파일들을 false로 설정하여 무시
      const testFiles = [
        'thread-stream/test',
        'thread-stream/bench',
      ];
      testFiles.forEach((file) => {
        config.resolve.alias[file] = false;
      });
    }
    
    return config;
  },
  // Turbopack 설정 (Next.js 16)
  experimental: {
    turbo: {
      resolveAlias: {
        'thread-stream/test': false,
        'thread-stream/bench': false,
      },
    },
  },
};

module.exports = nextConfig;




