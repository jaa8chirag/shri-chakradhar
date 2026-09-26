import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Ingests WooCommerce CSV exports (Products -> Export) and WordPress WXR XML exports
 * from /data/import/<brand>/. Used when a site's live API is blocked or broken and the
 * client provides a manual export instead. Safe to call even when no files are present.
 */
export interface ImportedProduct {
  sku: string | null;
  title: string;
  description: string;
  shortDescription: string;
  categories: string[];
  tags: string[];
  regularPrice: number | null;
  salePrice: number | null;
  images: string[];
  attributes: Record<string, string>;
}

export async function importBrandFiles(brandId: string): Promise<ImportedProduct[]> {
  const dir = path.join(process.cwd(), "data", "import", brandId);
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const products: ImportedProduct[] = [];

  for (const file of files) {
    const full = path.join(dir, file);
    if (file.toLowerCase().endsWith(".csv")) {
      products.push(...parseWooCsv(await readFile(full, "utf-8")));
    } else if (file.toLowerCase().endsWith(".xml")) {
      products.push(...parseWxrXml(await readFile(full, "utf-8")));
    }
  }
  return products;
}

function parseWooCsv(content: string): ImportedProduct[] {
  const rows = splitCsvRows(content);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iSku = idx("sku");
  const iName = idx("name");
  const iDesc = idx("description");
  const iShort = idx("short description");
  const iCats = idx("categories");
  const iTags = idx("tags");
  const iRegular = idx("regular price");
  const iSale = idx("sale price");
  const iImages = idx("images");

  return rows.slice(1).map((row) => ({
    sku: iSku >= 0 ? row[iSku] || null : null,
    title: iName >= 0 ? row[iName] || "" : "",
    description: iDesc >= 0 ? row[iDesc] || "" : "",
    shortDescription: iShort >= 0 ? row[iShort] || "" : "",
    categories: iCats >= 0 ? splitList(row[iCats]) : [],
    tags: iTags >= 0 ? splitList(row[iTags]) : [],
    regularPrice: iRegular >= 0 ? toNumber(row[iRegular]) : null,
    salePrice: iSale >= 0 ? toNumber(row[iSale]) : null,
    images: iImages >= 0 ? splitList(row[iImages]) : [],
    attributes: {},
  }));
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseFloat(value.replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
}

/** Minimal RFC4180 CSV parser: handles quoted fields, embedded commas/newlines, escaped quotes. */
function splitCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && content[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim().length > 0));
}

/** Parses a WordPress WXR export XML for `product` post-type items. */
function parseWxrXml(xml: string): ImportedProduct[] {
  const items: ImportedProduct[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  for (const block of itemBlocks) {
    const postType = matchTag(block, "wp:post_type");
    if (postType !== "product") continue;

    const title = decodeXml(matchTag(block, "title") ?? "");
    const description = decodeCdata(matchTag(block, "content:encoded") ?? "");
    const meta: Record<string, string> = {};
    const metaMatches = block.matchAll(/<wp:postmeta>[\s\S]*?<wp:meta_key>(.*?)<\/wp:meta_key>[\s\S]*?<wp:meta_value>([\s\S]*?)<\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g);
    for (const m of metaMatches) meta[decodeXml(m[1])] = decodeCdata(m[2]);

    const categories = Array.from(block.matchAll(/<category domain="product_cat"[^>]*nicename="[^"]*"><!\[CDATA\[(.*?)\]\]><\/category>/g)).map((m) => m[1]);
    const tags = Array.from(block.matchAll(/<category domain="product_tag"[^>]*nicename="[^"]*"><!\[CDATA\[(.*?)\]\]><\/category>/g)).map((m) => m[1]);

    items.push({
      sku: meta["_sku"] || null,
      title,
      description,
      shortDescription: "",
      categories,
      tags,
      regularPrice: meta["_regular_price"] ? toNumber(meta["_regular_price"]) : null,
      salePrice: meta["_sale_price"] ? toNumber(meta["_sale_price"]) : null,
      images: [],
      attributes: {},
    });
  }
  return items;
}

function matchTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const m = block.match(re);
  return m ? m[1] : null;
}

function decodeCdata(value: string): string {
  const m = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return decodeXml(m ? m[1] : value);
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
