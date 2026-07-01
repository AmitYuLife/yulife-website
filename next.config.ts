import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

// Repo is served from /yulife-website on GitHub Pages.
const base = "/yulife-website";

// Dev and production builds must not share a cache directory. Running
// `next build` while `next dev` is active (or after it) overwrites `.next` and
// leaves the dev server serving HTML that points at missing CSS chunks (404).
const distDir = process.env.NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  distDir,
  output: "export",
  trailingSlash: true,
  ...(isGithubPages && {
    basePath: base,
    assetPrefix: `${base}/`,
  }),
};

export default nextConfig;
