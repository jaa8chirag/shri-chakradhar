import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data";
import { SECTIONS } from "@/lib/sections";

const BASE_URL = "https://shrichakradhar-demo.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    ...SECTIONS.map((s) => ({ url: `${BASE_URL}${s.path}`, changeFrequency: "daily" as const, priority: 0.9 })),
    { url: `${BASE_URL}/combos`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/offers`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const productRoutes: MetadataRoute.Sitemap = catalog.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
