import devOrigins from "../../allowed-dev-origins.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: devOrigins,
};

export default nextConfig;

