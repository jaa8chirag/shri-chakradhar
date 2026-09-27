import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3001";
const outDir = process.argv[3] ?? ".";

const pages = [
  ["about", "/about"],
  ["contact", "/contact"],
  ["faq", "/faq"],
  ["combos", "/combos"],
  ["offers", "/offers"],
  ["account", "/account"],
  ["product", "/product/ignou-bsoc-131-study-material-book-bam-sociology-in-hindi"],
];

const browser = await chromium.launch();
for (const [name, path] of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${outDir}/wrap-${name}.png`, fullPage: true });
    console.log(name, "OK", errors.length ? `errors: ${JSON.stringify(errors)}` : "");
  } catch (e) {
    console.log(name, "FAILED:", e.message.slice(0, 200));
  }
  await page.close();
}
await browser.close();
