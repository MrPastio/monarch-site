import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = readFileSync(join(root, "app/styles/tokens.css"), "utf8");

/** WCAG 2.1 relative luminance and contrast ratio. */
function luminance(hex) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const part = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Reads a token from a specific block of tokens.css. */
function token(name, { dark = false } = {}) {
  const source = dark
    ? tokens.slice(tokens.indexOf(':root[data-theme="dark"]'))
    : tokens.slice(0, tokens.indexOf("@media (prefers-color-scheme: dark)"));
  const match = source.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `token --${name} not found (dark: ${dark})`);
  return match[1];
}

const pairs = [
  ["ink", "canvas", 4.5],
  ["ink-secondary", "canvas", 4.5],
  ["ink-tertiary", "canvas", 4.5],
  ["ink", "surface", 4.5],
  ["ink-secondary", "surface", 4.5],
  ["accent-ink", "canvas", 4.5],
  ["accent-ink", "surface", 4.5],
  ["ink-on-accent", "accent", 4.5],
  ["positive-ink", "positive-wash", 4.5],
  ["caution-ink", "caution-wash", 4.5],
  ["critical-ink", "critical-wash", 4.5],
  ["win-ink", "win-canvas", 4.5],
  ["win-ink-secondary", "win-canvas", 4.5],
  ["win-ink-tertiary", "win-canvas", 3],
];

for (const theme of ["light", "dark"]) {
  const dark = theme === "dark";
  for (const [foreground, background, minimum] of pairs) {
    test(`${theme}: --${foreground} on --${background} >= ${minimum}:1`, () => {
      // Product-window tokens are identical in both themes by design.
      const isWindow = foreground.startsWith("win-");
      const ratio = contrast(
        token(foreground, { dark: dark && !isWindow }),
        token(background, { dark: dark && !isWindow }),
      );
      assert.ok(
        ratio >= minimum,
        `contrast is ${ratio.toFixed(2)}:1, needs ${minimum}:1`,
      );
    });
  }
}
