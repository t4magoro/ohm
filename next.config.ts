import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // static files for GitHub Pages
  basePath: "/ohm", // the site lives at t4magoro.github.io/ohm
  images: { unoptimized: true },
};

export default nextConfig;