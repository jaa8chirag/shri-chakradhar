import type { NextConfig } from "next";

const SOURCE_DOMAINS = ["shrichakradhar.com", "ignouproject.com", "ignouquestionpaper.com", "ignousolvedassignment.com", "ignoustudymaterial.com"];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // lib/data.ts reads data/clean/*.json via a dynamic path (readJson(file: string)), which
  // Vercel's build-time file tracer can't statically detect the way it can a static import —
  // without this, those files could be missing from the deployed serverless function bundle,
  // 500-ing every page in production despite working fine in dev (where the whole repo is on
  // disk). data/runtime is excluded on purpose: on Vercel it's Redis-backed (see lib/kv.ts),
  // not read from disk at all.
  outputFileTracingIncludes: {
    "/**": ["./data/clean/**/*.json"],
  },
  images: {
    // Product images are downloaded locally by scripts/extract/download-assets.ts, but we
    // allow the source domains (apex + www, some redirect) too so next/image keeps working
    // against un-downloaded/remote fallbacks during development.
    remotePatterns: SOURCE_DOMAINS.flatMap((hostname) => [
      { protocol: "https" as const, hostname, pathname: "/wp-content/uploads/**" },
      { protocol: "https" as const, hostname: `www.${hostname}`, pathname: "/wp-content/uploads/**" },
    ]),
  },
  webpack: (config) => {
    // scripts/extract/* write continuously into data/raw, data/runtime and public/products
    // (thousands of files during a scrape/download run) — without this, the dev server's
    // file watcher treats every write as a source change and recompiles in an endless loop.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/.git/**", "**/data/raw/**", "**/data/runtime/**", "**/public/products/**", "**/public/brands/**", "**/*.log"],
    };
    return config;
  },
};

export default nextConfig;
