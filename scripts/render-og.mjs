/**
 * Open Graph images from the live hero, so a shared link looks like the site.
 * Needs the dev server: node scripts/render-og.mjs [http://localhost:4477]
 */
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:4477";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
for (const lang of ["ru", "en"]) {
  await page.goto(`${base}/${lang}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `header, nextjs-portal, [class*="stage"], [class*="facts"], [class*="note"] { display: none !important; }
      section[aria-labelledby="hero-title"] { padding-top: 92px !important; min-height: 630px; }`,
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `public/og/${lang}.jpg`, type: "jpeg", quality: 88 });
}
await browser.close();
