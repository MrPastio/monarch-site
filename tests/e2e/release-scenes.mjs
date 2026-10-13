// Headless check of the «Новое в 0.3» chapter: scrolls to every scene, lets its
// timeline finish and saves a screenshot. The in-app browser pane does not run
// requestAnimationFrame while hidden, so motion is checked here instead.
// Usage: node tests/e2e/release-scenes.mjs [baseUrl] [lang] [outDir]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [base = "http://localhost:4477", lang = "ru", outDir = "tmp/release-scenes"] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 860 }, colorScheme: "light" });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error.message)));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
await page.goto(`${base}/${lang}`, { waitUntil: "networkidle" });
await page.screenshot({ path: join(outDir, `${lang}-0-hero.png`) });
const count = await page.locator("#whats-new ol[aria-label] > li").count();
for (let index = 0; index < count; index += 1) {
  await page.evaluate(([i, n]) => {
    const track = document.querySelector("#whats-new [data-story]");
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, top + span * ((i + 0.5) / n));
  }, [index, count]);
  await page.waitForTimeout(6500);
  await page.screenshot({ path: join(outDir, `${lang}-${index + 1}-scene.png`) });
}
for (const id of ["abilities", "download"]) {
  const target = page.locator(`#${id}`);
  if (await target.count()) {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, `${lang}-${id}.png`) });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/${lang}`, { waitUntil: "networkidle" });
await page.screenshot({ path: join(outDir, `${lang}-mobile.png`), fullPage: false });
console.log(JSON.stringify({ scenes: count, errors }));
await browser.close();
