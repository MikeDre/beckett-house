import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sites serves the already-compressed local WebP assets directly. The
    // runtime image transformer is not available in the hosted environment.
    unoptimized: true,
  },
};

export default nextConfig;
