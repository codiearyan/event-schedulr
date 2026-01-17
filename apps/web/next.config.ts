import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@event-schedulr/backend", "@event-schedulr/env"],
};

export default nextConfig;
