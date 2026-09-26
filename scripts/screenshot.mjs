import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3002";
const outDir = process.argv[3] ?? ".";
const pages = [
  ["landing", "/"],
  ["admin-dashboard", "/admin"],
  ["admin-catalog", "/admin/catalog"],
  ["admin-orders", "/admin/orders"],
  ["admin-customers", "/admin/customers"],
  ["admin-projects", "/admin/projects"],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

// authenticate once, reuse the session for all admin pages
const loginPage = await context.newPage();
await loginPage.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
await loginPage.fill('input[type="password"]', "demo1234");
await loginPage.click('button[type="submit"]');
await loginPage.waitForURL(`${base}/admin`, { timeout: 10000 }).catch(() => {});
await loginPage.close();

for (const [name, path] of pages) {
  const page = await context.newPage();
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
