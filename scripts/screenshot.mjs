import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3002";
const outDir = process.argv[3] ?? ".";
const pages = [
  ["home-shrichakradhar", "/s/shrichakradhar"],
  ["browse-shrichakradhar", "/s/shrichakradhar/browse"],
  ["product-shrichakradhar", "/s/shrichakradhar/p/ignou-majy-2nd-year-hindi-medium-book-mjy-005-008"],
  ["search-shrichakradhar", "/s/shrichakradhar/search?q=MEG"],
  ["cart-shrichakradhar", "/s/shrichakradhar/cart"],
  ["home-ignouproject", "/s/ignouproject"],
  ["order-project-ignouproject", "/s/ignouproject/order-project"],
];

const browser = await chromium.launch();
for (const [name, path] of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log(name, "errors:", errors.length ? errors : "none");
  await page.close();
}
await browser.close();
