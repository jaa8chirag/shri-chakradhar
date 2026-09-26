# CP-0 Extraction Report

Generated: 2026-09-26T13:15:04.273Z

## Products per brand (before dedup)

| Brand | Products | Image success rate | Parse failures (no course code found) |
|---|---|---|---|
| Shri Chakradhar Publication Private limited | 18445 | 98% | 4 |
| IGNOU PROJECT | 0 | 0% | 0 |
| IGNOU Question Paper | 2219 | 73% | 0 |
| IGNOU Solved Assignment | 2497 | 99% | 0 |
| IGNOU Study Material | 3345 | 100% | 0 |

## Total unique products after cross-brand dedup: 16818

## Products shared across 2+ brands: 481

## Merge decisions logged: 5468

## Content policy: 103 handwritten-assignment products excluded (out of scope per the brief's content rules); overclaim phrases ("assured N+ marks", "guaranteed acceptance", "A+ guarantee") scrubbed from descriptions.

## Category counts (top 20)

| Category | Products |
|---|---|
| IGNOU Books | 4113 |
| IGNOU Solved Guess Papers | 3192 |
| IGNOU Solved Assignment 2026-27: Course-Wise PDF Solutions for All Programmes | 2195 |
| IGNOU Master Degree Books | 2008 |
| IGNOU Solved Assignment (Hard-Copy) | 1688 |
| IGNOU Bachelor Degree Books | 1450 |
| IGNOU MA Solved Guess Papers (Master Degree) | 1343 |
| IGNOU Previous Year Solved Paper | 1142 |
| IGNOU Bachelors Degree Solved Guess Papers | 1091 |
| IGNOU Solved Question Paper (Hard-Copy) | 1070 |
| IGNOU Solved Question Paper (Soft-Copy) | 1065 |
| IGNOU Books Combo | 1025 |
| IGNOU Master Degree Assignment | 995 |
| IGNOU Bachelor Degree Assignment | 985 |
| IGNOU Master Degree Study Material | 955 |
| IGNOU Master Degree Solved Assignment (Hard-Copy) | 765 |
| IGNOU Bachelor Degree Solved Assignment (Hard-Copy) | 713 |
| IGNOU Diplomas Books | 582 |
| IGNOU Master Degree Previous Year Solved Paper | 569 |
| IGNOU Master Degree Solved Question Paper (Hard-Copy) | 518 |

## Blocked sites

None — all 5 domains allowed the WooCommerce Store API / WP REST API endpoints via robots.txt.

Note: ignousolvedassignment.com's Store API returns a server-side 500 (not a robots block) — its catalog was extracted via the HTML fallback (`wp/v2/product` + per-product page parsing). See DECISIONS.md.

Note: ignouproject.com runs no WooCommerce at all — it's a custom project-writing service, extracted from its pages instead of a product catalog.
