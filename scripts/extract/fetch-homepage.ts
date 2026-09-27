import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { politeFetch } from "./lib/http";
import type { SiteConfig } from "./sites.config";

export interface HomepageExtract {
  logoUrl: string | null;
  faviconUrl: string | null;
  phones: string[];
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  social: Record<string, string>;
  colors: { primary: string | null; secondary: string | null };
}

const PHONE_RE = /(?:\+?91[-\s]?)?[6-9]\d{9}\b/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export async function fetchHomepage(site: SiteConfig): Promise<HomepageExtract> {
  const outDir = path.join(process.cwd(), "data", "raw", site.id);
  await mkdir(outDir, { recursive: true });

  const html = await politeFetch<string>(`https://${site.domain}/`, { brand: site.id, kind: "text" });
  const extract: HomepageExtract = {
    logoUrl: null,
    faviconUrl: null,
    phones: [],
    email: null,
    whatsapp: null,
    address: null,
    social: {},
    colors: { primary: null, secondary: null },
  };

  if (!html) {
    await writeFile(path.join(outDir, "homepage-extract.json"), JSON.stringify(extract, null, 2));
    return extract;
  }

  const $ = cheerio.load(html);
  const base = `https://${site.domain}`;

  const logoSelectors = [".custom-logo", "header img.logo", "header img[class*='logo']", "img[class*='logo']", ".site-logo img"];
  const LAZY_ATTRS = ["data-src", "data-lazy-src", "data-lazyload-src", "data-original"];
  for (const sel of logoSelectors) {
    const el = $(sel).first();
    if (el.length === 0) continue;
    // Lazy-load plugins leave `src` as a tiny placeholder (often a blank/near-empty inline SVG)
    // and put the real image in a data-* attribute until JS swaps it in.
    let src = LAZY_ATTRS.map((attr) => el.attr(attr)).find(Boolean) ?? el.attr("src");
    if (src && isRealImageUrl(src)) {
      extract.logoUrl = absolutize(src, base);
      break;
    }
  }
  // JSON-LD Organization schema (from Rank Math/Yoast) reliably carries the real logo
  // regardless of theme — this is what actually found the logo for sites whose header
  // markup doesn't use any recognizable "logo" class (e.g. Woodmart-themed stores).
  if (!extract.logoUrl) {
    $('script[type="application/ld+json"]').each((_, el) => {
      if (extract.logoUrl) return;
      try {
        const json = JSON.parse($(el).contents().text());
        const graph = Array.isArray(json["@graph"]) ? json["@graph"] : [json];
        for (const node of graph) {
          const logo = node?.logo;
          const logoUrl = typeof logo === "string" ? logo : logo?.url ?? logo?.contentUrl;
          if (logoUrl && isRealImageUrl(logoUrl)) {
            extract.logoUrl = absolutize(logoUrl, base);
            break;
          }
        }
      } catch {
        // malformed JSON-LD — skip
      }
    });
  }

  if (!extract.logoUrl) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og && isRealImageUrl(og)) extract.logoUrl = absolutize(og, base);
  }

  extract.faviconUrl =
    absolutize($('link[rel="icon"]').first().attr("href") ?? $('link[rel="shortcut icon"]').first().attr("href") ?? "", base) || null;

  const bodyText = $("body").text();
  extract.phones = Array.from(new Set((bodyText.match(PHONE_RE) ?? []).map((p) => p.replace(/[-\s]/g, ""))));

  const mailtoHref = $('a[href^="mailto:"]').first().attr("href");
  extract.email = mailtoHref ? mailtoHref.replace("mailto:", "").split("?")[0] : (bodyText.match(EMAIL_RE) ?? [])[0] ?? null;

  const waLink = $('a[href*="wa.me"], a[href*="api.whatsapp.com"]').first().attr("href");
  extract.whatsapp = waLink ?? null;

  $('a[href*="facebook.com"]').each((_, el) => {
    extract.social.facebook = $(el).attr("href") ?? "";
  });
  $('a[href*="instagram.com"]').each((_, el) => {
    extract.social.instagram = $(el).attr("href") ?? "";
  });
  $('a[href*="twitter.com"], a[href*="x.com"]').each((_, el) => {
    extract.social.twitter = $(el).attr("href") ?? "";
  });
  $('a[href*="youtube.com"]').each((_, el) => {
    extract.social.youtube = $(el).attr("href") ?? "";
  });
  $('a[href*="linkedin.com"]').each((_, el) => {
    extract.social.linkedin = $(el).attr("href") ?? "";
  });

  const addressEl = $("address, .address, .contact-address").first().text().trim();
  extract.address = addressEl || null;

  const themeColorMeta = $('meta[name="theme-color"]').attr("content");
  if (themeColorMeta && /^#[0-9a-fA-F]{3,6}$/.test(themeColorMeta)) {
    extract.colors.primary = themeColorMeta;
  } else {
    // Covers the common WP page-builder/theme variable names (Elementor, Astra, Divi, WP core
    // preset colors) since there's no single standard name for "brand primary color".
    const styleText = $("style").text();
    const colorMatches = Array.from(
      styleText.matchAll(
        /--(?:e-global-color-primary|e-global-color-accent|ast-global-color-0|ast-global-color-1|et_pb_theme_accent_color|wp--preset--color--primary|theme-color|primary-color|main-color)[^:]*:\s*(#[0-9a-fA-F]{3,6})/gi
      )
    );
    if (colorMatches.length > 0) extract.colors.primary = colorMatches[0][1];
  }

  await writeFile(path.join(outDir, "homepage-extract.json"), JSON.stringify(extract, null, 2));
  return extract;
}

/** Rejects lazy-load placeholders: inline data: URI blanks used before JS swaps in the real src. */
function isRealImageUrl(url: string): boolean {
  return !!url && !url.startsWith("data:");
}

function absolutize(url: string, base: string): string {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}
