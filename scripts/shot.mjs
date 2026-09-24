/**
 * Quick visual capture for design review.
 * node scripts/shot.mjs <url> <out.png> [width] [height] [waitMs] [scrollY] [--reduced]
 */
import { chromium } from "playwright-core";

const [url, out, w = "1440", h = "900", wait = "4000", scrollY = "0", ...flags] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: flags.includes("--dpr2") ? 2 : 1,
  reducedMotion: flags.includes("--reduced") ? "reduce" : "no-preference",
});
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") errors.push(`${message.type()}: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
await page.goto(url, { waitUntil: "networkidle" });
if (Number(scrollY)) {
  await page.evaluate((y) => window.scrollTo(0, y), Number(scrollY));
}
await page.waitForTimeout(Number(wait));
if (flags.includes("--full")) await page.screenshot({ path: out, fullPage: true });
else await page.screenshot({ path: out });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ out, overflow, errors }));
await browser.close();
