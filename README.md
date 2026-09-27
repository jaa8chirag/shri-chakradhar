# Shri Chakradhar Publication — Unified Store Demo

A client demo showing Shri Chakradhar Publication's 5 separate WordPress/WooCommerce sites
running as **one unified platform**: one catalog, one order system, one admin — instead of 5
sites with duplicated products and scattered orders.

Built with real data scraped from the client's live sites (see [DECISIONS.md](./DECISIONS.md)
for every judgment call made along the way, and [`data/clean/REPORT.md`](./data/clean/REPORT.md)
for the latest extraction numbers).

## Stack

Next.js 15 (App Router) + TypeScript, Tailwind CSS v4 + shadcn/ui (base-ui primitives), Framer
Motion, Fuse.js for search, Recharts for the admin dashboard. The catalog itself is static —
`/data/clean/*.json`, built by the pipeline below, no database. Orders, project-job requests and
admin catalog edits (visibility/price) go through `lib/orders-store.ts` / `lib/data.ts`'s
overrides functions, which write to a local JSON file for zero-setup local dev and to Upstash
Redis on Vercel (see "Deploying to Vercel" below) — Vercel's serverless functions can't write to
the filesystem, so a real store is required there, not optional.

## Running locally

```bash
pnpm install
pnpm dev
```

Open the printed localhost URL. Admin is at `/admin` (password: `demo1234`).

## Information architecture

Shri Chakradhar Publication is the **master brand**. The other 4 original sites are folded in
as **sections** of the one store, each keeping its own real logo as a sub-brand badge:

| Section | Route | Sub-brand | Product `type`s |
|---|---|---|---|
| Study Material & Help Books | `/study-material` | ignoustudymaterial | HelpBook, Combo |
| Solved Assignments | `/solved-assignments` | ignousolvedassignment | SolvedAssignment |
| Question Papers | `/question-papers` | ignouquestionpaper | QuestionPaper |
| Guess Papers | `/guess-papers` | shrichakradhar | GuessPaper |
| Projects & Synopsis | `/projects` (+ `/projects/custom` for the order form) | ignouproject | Project |

A product's section is derived purely from its `type` field (`lib/sections.ts`) — since the
master brand's own catalog already spans every type, this alone pools shrichakradhar's matching
products into each section alongside the specialist brand's, with no separate brand-union list
to maintain.

Old brand-scoped URLs (`/s/[brand]/...`, from before this was a unified store) redirect to the
matching section, so old links/bookmarks still resolve.

## Re-running the data pipeline

The scraper is polite by design: 1 request/second/domain, every response cached to
`/data/raw/<brand>/_cache/` so re-runs don't re-hit the client's sites.

```bash
# Fast pass: robots.txt, WooCommerce Store API, WP REST, homepage HTML — all 5 sites
npx tsx scripts/extract/run.ts fast

# Slow pass: only needed for ignousolvedassignment.com, whose Store API 500s server-side —
# falls back to per-product-page HTML parsing (~3800 pages, ~1 hour at 1 req/sec)
npx tsx scripts/extract/run.ts slow

# Normalize: dedup across brands, parse course codes, apply content policy, build
# /data/clean/{brands,catalog,categories,pages,stats,product-details}.json + REPORT.md
npx tsx scripts/extract/normalize.ts

# Download brand logos + product images to /public, converting to webp
npx tsx scripts/extract/download-assets.ts
```

Run them in that order. `download-assets.ts` rewrites `catalog.json`/`brands.json` in place to
point at the local files that landed on disk, so re-running `normalize.ts` afterwards resets
images back to remote URLs — always finish with `download-assets.ts` last.

If a site's live API becomes blocked, `scripts/extract/import-csv-xml.ts` ingests a WooCommerce
CSV export (Products → Export) or a WordPress WXR XML export dropped into
`/data/import/<brand>/` — built and wired up regardless of whether any site currently needs it.

## Adding a brand or section

1. Add the domain to `scripts/extract/sites.config.ts` and extract/normalize as above.
2. Add a `BRAND_META` entry in `scripts/extract/lib/normalize-brand.ts` (tagline, product types,
   fallback color if scraping finds none).
3. To make it its own section rather than folding into an existing one, add an entry to
   `SECTIONS` in `lib/sections.ts` (path, sub-brand, which product `type`s belong to it) — the
   header mega-menu, homepage rail, and section page all pick it up automatically from that list.

## Environment flags

- `NEXT_PUBLIC_BRAND_BY_HOSTNAME=true` — switches `middleware.ts` from route-prefix brand
  resolution to subdomain-based (e.g. `studymaterial.localhost:3000`), for when each brand gets
  its own real subdomain later. Off by default so the demo works on one URL.

## Deploying to Vercel

1. **Push to GitHub and import the repo in Vercel** as normal (Next.js is auto-detected). The
   repo is large (~750MB — mostly ~17,000 real scraped product images committed to `/public`,
   plus git history), so the initial clone/build may take longer than a typical Next.js project;
   this hasn't hit a hard Vercel limit in testing, but if it ever does, moving product images to
   a CDN/blob store instead of committing them is the fix (see `scripts/extract/download-assets.ts`
   for where they're written — swapping the destination is a contained change).
2. **Connect a Redis store before your first real click-through**: in the Vercel dashboard,
   Storage tab → Create Database → pick a Redis/Upstash option from the Marketplace → Connect to
   this project. This auto-injects `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (or
   `KV_REST_API_URL`/`KV_REST_API_TOKEN` — `lib/kv.ts` checks both names). Without this step,
   checkout, the custom project form, and the admin catalog visibility/price toggle will all
   still render correctly but throw an error when actually submitted, since there's no writable
   store connected.
3. **Set `NEXT_PUBLIC_SITE_URL`** to your real domain (or your `*.vercel.app` URL) once you know
   it, so sitemap.xml/robots.txt/JSON-LD emit correct absolute URLs — see `.env.example`. Without
   it, `lib/site-url.ts` falls back to Vercel's own auto-injected deployment URL, which works but
   changes per-deployment on the Hobby plan.
4. Redeploy after adding the Redis integration/env vars (Vercel prompts for this automatically
   when you connect a new integration).

Everything read-only — browsing, search, all product/section pages, admin's dashboard/orders/
customers views — works with zero extra setup, since those never touch the filesystem in
production; only the three write paths above need the Redis step.

## Known gaps

- **ignouquestionpaper.com's brand color** (`#b91c1c`, red) is a reasoned manual guess, not
  scraped or sampled — the site's own CSS never exposed a usable theme-color signal and too few
  of its product images had downloaded yet to sample confidently when this was last checked. See
  DECISIONS.md.
- **No dynamic OG image generation** — product/section pages don't yet generate a custom
  Open Graph image (brand logo + product cover composited). Static metadata only.
- **Repo size** (~750MB) is dominated by committed product images. Works for a demo; a real
  production build would serve these from a CDN/blob store instead of the git repo.
- Full Lighthouse mobile-90 audit hasn't been run in this environment (no Lighthouse CLI
  available); manual checks confirm no horizontal scroll at 360/768/1280px and clean
  `next/image` usage throughout.

## Demo walkthrough

See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for a 10-minute click-by-click script.

---

Demo by GGM Technologies.
