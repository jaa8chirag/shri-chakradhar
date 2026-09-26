import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { SiteConfig } from "../sites.config";
import type { BrandPages } from "../../../lib/types";
import { sanitizeHtml, stripToText } from "./sanitize-html";

export async function buildBrandPages(site: SiteConfig): Promise<BrandPages> {
  const rawDir = path.join(process.cwd(), "data", "raw", site.id);
  const pages = (await readJsonSafe<any[]>(path.join(rawDir, "wp-pages.json"))) ?? [];
  const posts = (await readJsonSafe<any[]>(path.join(rawDir, "wp-posts.json"))) ?? [];

  const find = (patterns: RegExp[]) => pages.find((p) => patterns.some((re) => re.test(p.slug) || re.test(stripToText(p.title?.rendered ?? ""))));

  const about = find([/about/i]);
  const contact = find([/contact/i]);
  const faq = find([/faq/i]);
  const policyPages = pages.filter((p) => /polic|terms|refund|shipping|privacy/i.test(p.slug));

  return {
    about: about ? sanitizeHtml(about.content?.rendered ?? "") : null,
    contact: contact ? sanitizeHtml(contact.content?.rendered ?? "") : null,
    faq: faq ? sanitizeHtml(faq.content?.rendered ?? "") : null,
    policies: policyPages.map((p) => ({
      title: stripToText(p.title?.rendered ?? ""),
      content: sanitizeHtml(p.content?.rendered ?? ""),
    })),
    posts: posts.slice(0, 6).map((p) => ({
      title: stripToText(p.title?.rendered ?? ""),
      excerpt: stripToText(p.excerpt?.rendered ?? "").slice(0, 160),
      date: p.date ?? "",
      slug: p.slug ?? "",
    })),
  };
}

async function readJsonSafe<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}
