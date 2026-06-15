import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(isGithubPages && {
    basePath: "/yulife-website",
    assetPrefix: "/yulife-website/",
  }),
};

export default nextConfig;
