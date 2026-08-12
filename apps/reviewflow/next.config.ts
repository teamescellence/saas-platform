import type { NextConfig } from "next";
import devOrigins from "../../allowed-dev-origins.js";

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
};

export default nextConfig;

