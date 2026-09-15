import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/arkhivum-site",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
