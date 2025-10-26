import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  basePath: '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eabqgmhadverstykzcrr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
