import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Next.js/Turbopack the monorepo root so it resolves workspace packages
  // correctly and doesn't warn about multiple lockfiles.
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
