/**
 * Strips WordPress shortcodes, inline event handlers, <script>/<style> tags and tracking attributes
 * from product/page descriptions, keeping basic structural HTML (p, table, ul, h2 etc).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/\[[^\]]*\]/g, "") // WordPress shortcodes [gallery], [vc_row], etc.
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "") // inline event handlers
    .replace(/\sstyle="[^"]*"/gi, "") // inline styles
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

export function stripToText(html: string): string {
  return sanitizeHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
