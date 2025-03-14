const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://101.96.66.219:8001/api/:path*', // Proxy all API requests
      },
    ];
  },
};

export default nextConfig;
