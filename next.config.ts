import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // basePath removed — site now lives at root of metbarista.com
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
