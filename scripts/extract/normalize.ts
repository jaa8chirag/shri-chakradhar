import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SITES } from "./sites.config";
import { buildBrand } from "./lib/normalize-brand";
import { loadSiteProducts } from "./lib/normalize-catalog";
import { dedupCatalog } from "./lib/dedup";
import { buildBrandPages } from "./lib/normalize-pages";
import { isHandwrittenAssignment } from "./lib/content-policy";
import type { Brand, BrandId, CategoryNode, Product, Stats } from "../../lib/types";

const CLEAN_DIR = path.join(process.cwd(), "data", "clean");

async function main() {
  await mkdir(CLEAN_DIR, { recursive: true });

  const brands: Brand[] = [];
  const pagesByBrand: Record<string, ReturnType<typeof buildBrandPages> extends Promise<infer T> ? T : never> = {} as any;
  const perBrandRaw: Record<string, Product[]> = {};
  let excludedHandwritten = 0;

  for (const site of SITES) {
    brands.push(await buildBrand(site));
    pagesByBrand[site.id] = await buildBrandPages(site);
    const siteProducts = await loadSiteProducts(site);
    const filtered = siteProducts.filter((p) => !isHandwrittenAssignment(p));
    excludedHandwritten += siteProducts.length - filtered.length;
    perBrandRaw[site.id] = filtered;
  }
  console.log(`Excluded ${excludedHandwritten} handwritten-assignment products (out of scope per content rules).`);

  const allProducts = Object.values(perBrandRaw).flat();
  const { merged, mergeLog } = dedupCatalog(allProducts);

  const categories = buildCategoryTree(merged);

  const stats: Stats = {
    perBrand: Object.fromEntries(
      SITES.map((site) => {
        const products = perBrandRaw[site.id];
        const withImages = products.filter((p) => p.images.length > 0).length;
        return [
          site.id,
          {
            productCount: products.length,
            imageSuccessRate: products.length ? Math.round((withImages / products.length) * 100) / 100 : 0,
            parseFailures: products.filter((p) => p.courseCodes.length === 0).length,
          },
        ];
      })
    ) as Stats["perBrand"],
    totalUniqueProducts: merged.length,
    sharedAcross2Plus: merged.filter((p) => p.availableOn.length > 1).length,
    categoryCounts: countCategories(merged),
    blockedSites: [],
    excludedHandwrittenAssignments: excludedHandwritten,
    mergeLog,
  };

  // description/shortDescription/categories/tags are only rendered on a single product's own
  // detail page (never on browse/search/home, which just need id/title/price/courseCodes/images).
  // At 17k+ merged products these fields alone made catalog.json ~99MB — split them into a
  // side file the detail page hydrates on demand (see lib/data.ts's getProductBySlug), keeping
  // the file every list view loads lean. Still fully "Product"-shaped once hydrated.
  const details: Record<string, Pick<Product, "description" | "shortDescription" | "categories" | "tags">> = {};
  const catalogSlim = merged.map((p) => {
    details[p.id] = { description: p.description, shortDescription: p.shortDescription, categories: p.categories, tags: p.tags };
    return { ...p, description: "", shortDescription: "", categories: [], tags: [] };
  });

  await writeFile(path.join(CLEAN_DIR, "brands.json"), JSON.stringify(brands, null, 2));
  await writeFile(path.join(CLEAN_DIR, "catalog.json"), JSON.stringify(catalogSlim, null, 2));
  await writeFile(path.join(CLEAN_DIR, "product-details.json"), JSON.stringify(details, null, 2));
  await writeFile(path.join(CLEAN_DIR, "categories.json"), JSON.stringify(categories, null, 2));
  await writeFile(path.join(CLEAN_DIR, "pages.json"), JSON.stringify(pagesByBrand, null, 2));
  await writeFile(path.join(CLEAN_DIR, "stats.json"), JSON.stringify(stats, null, 2));
  await writeFile(path.join(CLEAN_DIR, "REPORT.md"), renderReport(stats, brands));

  console.log(renderReport(stats, brands));
}

function buildCategoryTree(products: Product[]): CategoryNode[] {
  const levels = ["Masters", "Bachelors", "Diploma", "Certificate", "Other"] as const;
  const tree: CategoryNode[] = [];

  for (const level of levels) {
    const levelProducts = products.filter((p) => (p.level ?? "Other") === level);
    if (levelProducts.length === 0) continue;

    const programmeMap = new Map<string, Product[]>();
    for (const p of levelProducts) {
      const key = p.programme ?? "Other";
      const list = programmeMap.get(key) ?? [];
      list.push(p);
      programmeMap.set(key, list);
    }

    const programmeNodes: CategoryNode[] = Array.from(programmeMap.entries()).map(([programme, progProducts]) => {
      const courseMap = new Map<string, number>();
      for (const p of progProducts) {
        for (const code of p.courseCodes.length ? p.courseCodes : ["Uncoded"]) {
          courseMap.set(code, (courseMap.get(code) ?? 0) + 1);
        }
      }
      const courseNodes: CategoryNode[] = Array.from(courseMap.keys())
        .sort()
        .map((code) => ({ id: slugify(`${programme}-${code}`), name: code, slug: slugify(code), children: [] }));

      return { id: slugify(`${level}-${programme}`), name: programme, slug: slugify(programme), children: courseNodes };
    });

    tree.push({ id: slugify(level), name: level, slug: slugify(level), children: programmeNodes });
  }

  return tree;
}

function countCategories(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) {
    for (const c of p.categories) counts[c] = (counts[c] ?? 0) + 1;
  }
  return counts;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderReport(stats: Stats, brands: Brand[]): string {
  const lines: string[] = [];
  lines.push("# CP-0 Extraction Report\n");
  lines.push(`Generated: ${new Date().toISOString()}\n`);
  lines.push("## Products per brand (before dedup)\n");
  lines.push("| Brand | Products | Image success rate | Parse failures (no course code found) |");
  lines.push("|---|---|---|---|");
  for (const brand of brands) {
    const s = stats.perBrand[brand.id as BrandId];
    lines.push(`| ${brand.name} | ${s.productCount} | ${Math.round(s.imageSuccessRate * 100)}% | ${s.parseFailures} |`);
  }
  lines.push("");
  lines.push(`## Total unique products after cross-brand dedup: ${stats.totalUniqueProducts}\n`);
  lines.push(`## Products shared across 2+ brands: ${stats.sharedAcross2Plus}\n`);
  lines.push(`## Merge decisions logged: ${stats.mergeLog.length}\n`);
  lines.push(
    `## Content policy: ${stats.excludedHandwrittenAssignments} handwritten-assignment products excluded (out of scope per the brief's content rules); overclaim phrases ("assured N+ marks", "guaranteed acceptance", "A+ guarantee") scrubbed from descriptions.\n`
  );
  lines.push("## Category counts (top 20)\n");
  const topCats = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  lines.push("| Category | Products |");
  lines.push("|---|---|");
  for (const [cat, count] of topCats) lines.push(`| ${cat} | ${count} |`);
  lines.push("");
  if (stats.blockedSites.length > 0) {
    lines.push("## Blocked sites\n");
    for (const s of stats.blockedSites) lines.push(`- ${s}`);
  } else {
    lines.push("## Blocked sites\n\nNone — all 5 domains allowed the WooCommerce Store API / WP REST API endpoints via robots.txt.\n");
    lines.push(
      "Note: ignousolvedassignment.com's Store API returns a server-side 500 (not a robots block) — its catalog was extracted via the HTML fallback (`wp/v2/product` + per-product page parsing). See DECISIONS.md.\n"
    );
    lines.push("Note: ignouproject.com runs no WooCommerce at all — it's a custom project-writing service, extracted from its pages instead of a product catalog.\n");
  }
  return lines.join("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
