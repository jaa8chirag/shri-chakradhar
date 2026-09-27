import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { SiteConfig } from "../sites.config";
import type { Brand, ProductType } from "../../../lib/types";

const BRAND_META: Record<string, { tagline: string; productTypes: ProductType[]; isServiceBrand?: boolean; fallbackPrimary: string }> = {
  shrichakradhar: {
    tagline: "IGNOU help books, projects & solved assignments — one trusted source since day one",
    productTypes: ["HelpBook", "SolvedAssignment", "GuessPaper", "Project", "Combo"],
    fallbackPrimary: "#f2820a", // sampled from real product cover art — see DECISIONS.md
  },
  ignouproject: {
    tagline: "Custom IGNOU project & synopsis writing — synopsis next day, report in ~8 days",
    productTypes: ["Project"],
    isServiceBrand: true,
    fallbackPrimary: "#0f766e",
  },
  ignouquestionpaper: {
    tagline: "Previous years' solved IGNOU question papers, from ₹19",
    productTypes: ["QuestionPaper"],
    fallbackPrimary: "#b91c1c",
  },
  ignousolvedassignment: {
    tagline: "IGNOU solved assignments, PDF download",
    productTypes: ["SolvedAssignment"],
    fallbackPrimary: "#f0691e", // sampled from real product cover art — see DECISIONS.md
  },
  ignoustudymaterial: {
    tagline: "IGNOU guide books, help books & combo study material",
    productTypes: ["HelpBook", "Combo"],
    fallbackPrimary: "#1e293b", // real covers are a dark navy/monochrome design, not a bright accent — see DECISIONS.md
  },
};

/** Best available remote logo URL: homepage extraction (custom-logo / JSON-LD / og:image) first, then the WP site icon. */
export function resolveLogoUrl(homepage: any, siteInfo: any): string | null {
  return homepage?.logoUrl ?? siteInfo?.site_icon_url ?? null;
}

export async function buildBrand(site: SiteConfig): Promise<Brand> {
  const rawDir = path.join(process.cwd(), "data", "raw", site.id);
  const meta = BRAND_META[site.id];

  const siteInfo = await readJsonSafe<any>(path.join(rawDir, "wp-site.json"));
  const homepage = await readJsonSafe<any>(path.join(rawDir, "homepage-extract.json"));
  const logoUrl = resolveLogoUrl(homepage, siteInfo);

  return {
    id: site.id as Brand["id"],
    domain: site.domain,
    name: siteInfo?.name ?? site.name,
    tagline: meta.tagline,
    logo: logoUrl ? toLocalBrandPath(site.id, logoUrl) : `/brands/${site.id}/logo-placeholder.svg`,
    favicon: homepage?.faviconUrl ? toLocalBrandPath(site.id, homepage.faviconUrl, "favicon") : `/brands/${site.id}/favicon-placeholder.svg`,
    colors: { primary: homepage?.colors?.primary ?? meta.fallbackPrimary, secondary: homepage?.colors?.secondary ?? "#0f172a" },
    phones: homepage?.phones ?? [],
    email: homepage?.email ?? null,
    whatsapp: homepage?.whatsapp ?? null,
    address: homepage?.address ?? null,
    social: homepage?.social ?? {},
    productTypes: meta.productTypes,
    isServiceBrand: meta.isServiceBrand,
  };
}

function toLocalBrandPath(brandId: string, remoteUrl: string, kind: "logo" | "favicon" = "logo"): string {
  // Must match download-assets.ts's actual output naming: svg stays svg, everything else becomes webp.
  const ext = path.extname(new URL(remoteUrl).pathname).toLowerCase() === ".svg" ? "svg" : "webp";
  return `/brands/${brandId}/${kind}.${ext}`;
}

async function readJsonSafe<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}
