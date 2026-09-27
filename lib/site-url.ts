/**
 * Resolves the site's own base URL for sitemap/robots/JSON-LD absolute links.
 * Priority: an explicit NEXT_PUBLIC_SITE_URL (set this once you know your real domain) ->
 * Vercel's auto-injected production URL -> Vercel's per-deployment URL -> localhost for dev.
 * Never hardcode a guessed vercel.app URL here — every real deployment gets its own.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
