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
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019b65f1-1120-5da3-eefc-b566e8a99403',
        permanent: false,
      },
    ];
  },
  // Turbopack 비활성화 (webpack 사용)
  experimental: {
    turbo: undefined,
  },
  // Webpack 설정
  webpack: (config, { webpack }) => {
    config.plugins = config.plugins || [];
    
    // React Native 전용 패키지 무시 (웹 환경에서는 불필요)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      })
    );
    
    // Fallback 설정으로 optional dependencies 처리
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
