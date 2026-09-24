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
page.on("response", (response) => {
  if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
await page.goto(url, { waitUntil: "networkidle" });
if (scrollY.startsWith("sel:")) {
  const [sel, off = "0"] = scrollY.slice(4).split("@");
  await page.evaluate(async ([s, o]) => {
    const el = document.querySelector(s);
    const y = el.getBoundingClientRect().top + window.scrollY + Number(o);
    for (let i = 1; i <= 12; i++) { window.scrollTo(0, (y * i) / 12); await new Promise((r) => setTimeout(r, 60)); }
  }, [sel, off]);
} else if (Number(scrollY)) {
  await page.evaluate(async (y) => { for (let i = 1; i <= 12; i++) { window.scrollTo(0, (y * i) / 12); await new Promise((r) => setTimeout(r, 60)); } }, Number(scrollY));
}
await page.waitForTimeout(Number(wait));
if (flags.includes("--clean")) {
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((node) => node.remove()));
}
if (flags.includes("--full")) await page.screenshot({ path: out, fullPage: true });
else await page.screenshot({ path: out });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ out, overflow, errors }));
await browser.close();
