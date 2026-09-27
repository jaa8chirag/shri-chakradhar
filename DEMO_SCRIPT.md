# Demo Script — 10 Minutes

A click-by-click walkthrough for presenting the unified store to the client.

## 1. The problem, in one screen (30s)

Open the homepage (`/`). Point out: one search bar, one header, all 5 of their businesses
visible as sections in the nav — not 5 separate WordPress logins. Scroll to "Our Brands" at the
bottom: their 5 real logos, still recognizable, now living under one roof.

## 2. Course-code search (1 min)

In the header search bar, type a real course code — **`MMPC 001`** or **`BEGC 134`**. Show that
results come back instantly, matched on the code specifically (not a generic keyword match),
regardless of spacing or hyphenation. This directly answers their stated pain point: *"hard to
find products among thousands of course codes."*

## 3. The mega-menu (1 min)

Hover **Question Papers** in the header. Show the 3-part menu: Level tabs on the left, real
programmes with live product counts in the middle, and the sub-brand's own promo card on the
right (their real logo, real starting price, key facts). Switch to **Masters** to show the
programme list update. This is the "replace the giant mega-menu" ask, done properly.

## 4. A product page (1 min)

Click into any product. Point out: course-code chips, format/language badges, real price with
the real discount percentage, and — scroll down — **"Complete your programme"**, other course
materials from the same programme, pulled from the one shared catalog.

## 5. Cart → checkout (2 min)

Add 2-3 products to cart (ideally from different sections, to set up the multi-brand order
story). Go to `/cart`, then `/checkout`. Fill the form, hit **"Pay ₹X (Razorpay demo)"** — call
out that it's clearly labeled as a demo, no real payment happens. Land on the confirmation page.

## 6. The unified admin — the payoff (3 min)

Go to `/admin` (password `demo1234`).

- **Dashboard**: totals across all 5 brands in one view, revenue chart, top course codes.
- **Catalog**: search for the same course code from step 2. Toggle its visibility off for one
  brand using the colored toggle buttons — **then open that brand's section page in another tab
  and refresh** to show the product is instantly gone from the storefront. This is the single
  best "wow" moment in the demo: one edit, reflected live, no separate admin logins.
- **Orders**: the order just placed in step 5 is here, with a "Source brand" column — proving
  orders from all 5 original sites land in one list.
- **Projects**: drag a card between kanban columns (e.g. "Synopsis Draft" → "Sent for
  Approval") to show the project pipeline is live, not a static mockup.

## 7. The custom project flow (1 min)

Back on the storefront, go to **Projects & Synopsis** → **"Start your project"**
(`/projects/custom`). Fill the short form and submit — then return to `/admin/projects` and show
the new card has appeared in the **Topic** column. This demonstrates the ignouproject.com
service (not a product catalog) is fully wired into the same admin.

## 8. Close

Return to `/`. Reiterate the before/after: 5 disconnected WordPress sites with duplicated
listings and scattered orders → one catalog, one order system, one admin, with each brand's
identity preserved for their existing customers.

---

**If asked "is this the real site?"**: make clear this is a demo running on real scraped data
(products, prices, images, logos, contact details) from their actual sites, not synthetic
placeholder content — but checkout is a mock (no real Razorpay integration) and there's no real
customer login yet. Both are straightforward to add on top of this same foundation.
