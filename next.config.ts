import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // There's no runtime image transformer on the Worker. Instead
    // scripts/responsive-images.mjs pre-generates 640px and 1080px copies at
    // build time, and worker/index.ts serves the nearest one for each srcset width.
    deviceSizes: [640, 1080, 1920],
  },
};

export default nextConfig;
