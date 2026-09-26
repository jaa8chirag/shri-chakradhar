import type { Product } from "../../../lib/types";

/**
 * Per the brief's content rules: the handwritten-assignment service is out of scope for this
 * demo entirely (books, solved papers, guess papers, study material and project guidance only),
 * and specific overpromising claims ("guaranteed acceptance", "assured 90+ marks", "A+ guarantee")
 * must not carry over even if the client's live copy has them.
 *
 * Note: real product copy here mostly uses "guarantee" honestly — to *disclaim* outcomes
 * ("No claim is made about the marks...", "not a guarantee") — so we don't blanket-strip the
 * word; only the specific overclaim phrasing is removed.
 */
export function isHandwrittenAssignment(product: Pick<Product, "title" | "categories">): boolean {
  return /handwritten/i.test(product.title) || product.categories.some((c) => /handwritten/i.test(c));
}

const OVERCLAIM_PATTERNS = [/assured\s+\d+\+?\s*marks?/gi, /guaranteed\s+acceptance/gi, /A\+\s*guarantee/gi];

export function scrubOverclaims(text: string): string {
  if (!text) return text;
  let result = text;
  for (const pattern of OVERCLAIM_PATTERNS) {
    // Drop the sentence containing the claim rather than leaving a dangling half-sentence.
    result = result.replace(new RegExp(`[^.!?]*${pattern.source}[^.!?]*[.!?]`, "gi"), "");
  }
  return result;
}
