import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/adhelia-birthday" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root: process.cwd() },
  devIndicators: false,
};

export default nextConfig;
