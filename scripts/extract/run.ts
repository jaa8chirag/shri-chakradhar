import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SITES } from "./sites.config";
import { fetchRobots } from "./lib/http";
import { fetchStoreApi } from "./fetch-wc-store";
import { fetchWpRest } from "./fetch-wp-rest";
import { fetchHomepage } from "./fetch-homepage";
import { fetchHtmlFallback } from "./fetch-html-fallback";

/**
 * CP-0 extraction orchestrator.
 * Usage:
 *   tsx scripts/extract/run.ts fast   -> robots + WC store API + WP REST + homepage for all sites (skips slow HTML fallback)
 *   tsx scripts/extract/run.ts slow   -> only the slow per-product HTML fallback for ignousolvedassignment.com
 *   tsx scripts/extract/run.ts all    -> everything, sequentially (slow)
 */
async function main() {
  const mode = process.argv[2] ?? "fast";
  const robotsDir = path.join(process.cwd(), "data", "raw", "_robots");
  await mkdir(robotsDir, { recursive: true });

  for (const site of SITES) {
    const robots = await fetchRobots(site.domain);
    await writeFile(path.join(robotsDir, `${site.id}.txt`), robots);
  }
  console.log("robots.txt captured for all sites.");

  if (mode === "fast" || mode === "all") {
    for (const site of SITES) {
      console.log(`\n=== ${site.id} (fast) ===`);
      await fetchWpRest(site);
      await fetchHomepage(site);
      if (site.hasWooCommerce && !site.storeApiBroken) {
        await fetchStoreApi(site);
      }
    }
  }

  if (mode === "slow" || mode === "all") {
    for (const site of SITES) {
      if (site.storeApiBroken) {
        console.log(`\n=== ${site.id} (slow HTML fallback) ===`);
        await fetchHtmlFallback(site);
      }
    }
  }

  console.log("\nExtraction run complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
