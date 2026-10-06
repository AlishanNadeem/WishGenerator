import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows loading the dev server from devices on the local network (e.g. testing
  // mobile responsiveness on a phone via http://<lan-ip>:3000) without the
  // "Cross-origin access to Next.js dev resources is blocked" warning.
  allowedDevOrigins: ["192.168.1.110"],
};

export default nextConfig;
