import type { Product, Stats } from "../../../lib/types";

export interface DedupResult {
  merged: Product[];
  mergeLog: Stats["mergeLog"];
}

/**
 * Cross-brand dedup: match by (normalized course codes + type + format + language),
 * falling back to fuzzy title similarity (token Jaccard). SKUs aren't comparable across
 * brands since each WooCommerce install assigns its own. Every merge decision is logged.
 */
export function dedupCatalog(allProducts: Product[]): DedupResult {
  const buckets = new Map<string, Product[]>();
  const mergeLog: Stats["mergeLog"] = [];

  for (const product of allProducts) {
    const key = matchKey(product);
    const bucket = buckets.get(key) ?? [];
    bucket.push(product);
    buckets.set(key, bucket);
  }

  const merged: Product[] = [];
  for (const [, bucket] of buckets) {
    if (bucket.length === 1) {
      merged.push(bucket[0]);
      continue;
    }
    // Within a bucket, further split by title similarity to avoid merging genuinely
    // different products that happen to share codes/type/format/language.
    const groups = groupByTitleSimilarity(bucket);
    for (const group of groups) {
      if (group.length === 1) {
        merged.push(group[0]);
        continue;
      }
      const primary = group.reduce((longest, p) => (p.description.length > longest.description.length ? p : longest), group[0]);
      const mergedProduct: Product = {
        ...primary,
        availableOn: Array.from(new Set(group.flatMap((p) => p.availableOn))),
        sourceUrls: Object.assign({}, ...group.map((p) => p.sourceUrls)),
        images: (primary.images.length ? primary.images : group.flatMap((p) => p.images)).slice(0, 5),
        courseCodes: Array.from(new Set(group.flatMap((p) => p.courseCodes))),
        categories: Array.from(new Set(group.flatMap((p) => p.categories))),
        tags: Array.from(new Set(group.flatMap((p) => p.tags))),
      };
      merged.push(mergedProduct);
      mergeLog.push({
        keptId: primary.id,
        mergedFrom: group.filter((p) => p.id !== primary.id).map((p) => p.id),
        reason: `same course codes [${primary.courseCodes.join(",")}] + type=${primary.type} + format=${primary.format} + language=${primary.language} + similar title`,
      });
    }
  }

  return { merged, mergeLog };
}

function matchKey(p: Product): string {
  const codes = [...p.courseCodes].sort().join("|") || "no-code";
  return `${codes}::${p.type}::${p.format}::${p.language ?? "any"}`;
}

function groupByTitleSimilarity(products: Product[]): Product[][] {
  const groups: Product[][] = [];
  for (const product of products) {
    let placed = false;
    for (const group of groups) {
      if (titleSimilarity(group[0].title, product.title) >= 0.5) {
        group.push(product);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([product]);
  }
  return groups;
}

function titleSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.size / union.size;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}
