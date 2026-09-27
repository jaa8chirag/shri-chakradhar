import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3001";
const outDir = process.argv[3] ?? ".";

const browser = await chromium.launch();

// Desktop: homepage full scroll
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outDir}/homepage-full.png`, fullPage: true });
  console.log("homepage-full errors:", errors.length ? errors : "none");
  await page.close();
}

// Desktop: header with each mega menu open
const sections = ["Study Material", "Solved Assignments", "Question Papers", "Guess Papers", "Projects"];
for (const label of sections) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.hover(`text=${label}`);
  await page.waitForTimeout(400);
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  await page.screenshot({ path: `${outDir}/megamenu-${slug}.png`, fullPage: false });
  await page.close();
}

// Mobile: drawer open
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.click('button[aria-label="Menu"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/mobile-drawer.png`, fullPage: false });
  console.log("mobile-drawer errors:", errors.length ? errors : "none");
  await context.close();
}

// One section page (desktop)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/question-papers`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/section-question-papers.png`, fullPage: true });
  console.log("section-question-papers errors:", errors.length ? errors : "none");
  await page.close();
}

await browser.close();
