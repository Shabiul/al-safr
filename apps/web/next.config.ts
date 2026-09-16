import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@al-safr/db", "@al-safr/shared"],
};

export default nextConfig;
