import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next from picking the wrong workspace root when multiple lockfiles exist.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
