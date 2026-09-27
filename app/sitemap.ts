import type { MetadataRoute } from "next";
import { getStorefrontCatalog } from "@/lib/data";
import { SECTIONS } from "@/lib/sections";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getStorefrontCatalog();
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    ...SECTIONS.map((s) => ({ url: `${baseUrl}${s.path}`, changeFrequency: "daily" as const, priority: 0.9 })),
    { url: `${baseUrl}/combos`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/offers`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const productRoutes: MetadataRoute.Sitemap = catalog.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
