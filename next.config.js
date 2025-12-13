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
  // Turbopack 비활성화 (webpack 사용)
  experimental: {
    turbo: undefined,
  },
  // Webpack 설정으로 테스트 파일 제외
  webpack: (config, { webpack }) => {
    // thread-stream의 테스트 파일들과 관련 파일들을 완전히 무시
    config.plugins = config.plugins || [];
    
    // 여러 패턴으로 테스트 파일 제외
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^thread-stream\/test/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^thread-stream\/bench/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /thread-stream.*\.test\./,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /thread-stream.*\.md$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /thread-stream\/LICENSE$/,
      }),
      // thread-stream의 index.js가 test를 require하는 것을 방지
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream\/test/,
        require.resolve('./lib/empty-module.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream\/bench/,
        require.resolve('./lib/empty-module.js')
      )
    );
    
    // 테스트 파일 경로를 무시하도록 alias 설정
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // 테스트 파일들을 false로 설정하여 무시
    const testFiles = [
      'thread-stream/test',
      'thread-stream/bench',
      'thread-stream/LICENSE',
    ];
    testFiles.forEach((file) => {
      config.resolve.alias[file] = false;
    });
    
    return config;
  },
};

module.exports = nextConfig;
