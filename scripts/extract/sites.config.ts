export interface SiteConfig {
  id: string;
  domain: string;
  name: string;
  hasWooCommerce: boolean;
  /** Products endpoint 500s on this host (server-side bug on their end, not a robots block) — use HTML fallback. */
  storeApiBroken?: boolean;
}

export const SITES: SiteConfig[] = [
  { id: "shrichakradhar", domain: "shrichakradhar.com", name: "Shri Chakradhar Publication", hasWooCommerce: true },
  { id: "ignouproject", domain: "ignouproject.com", name: "IGNOU Project", hasWooCommerce: false },
  { id: "ignouquestionpaper", domain: "ignouquestionpaper.com", name: "IGNOU Question Paper", hasWooCommerce: true },
  { id: "ignousolvedassignment", domain: "ignousolvedassignment.com", name: "IGNOU Solved Assignment", hasWooCommerce: true, storeApiBroken: true },
  { id: "ignoustudymaterial", domain: "ignoustudymaterial.com", name: "IGNOU Study Material", hasWooCommerce: true },
];
