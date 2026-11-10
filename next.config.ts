import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The redesign was built at /v2 before it became the home page.
  async redirects() {
    return [{ source: '/v2', destination: '/', permanent: false }];
  },
};

export default nextConfig;
