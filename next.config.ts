import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from LAN / host-only adapters.
  // (Production builds are not affected.)
  allowedDevOrigins: ["192.168.56.1", "localhost", "127.0.0.1"],
};

export default nextConfig;
