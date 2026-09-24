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

const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

function token(name) {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `token --${name} not found`);
  return match[1];
}

const pairs = [
  ["ink", "canvas", 4.5],
  ["ink-2", "canvas", 4.5],
  ["ink-3", "canvas", 4.5],
  ["ink", "surface", 4.5],
  ["ink-2", "surface-2", 4.5],
  ["ink-3", "surface", 4.5],
  ["accent-ink", "canvas", 4.5],
  ["accent", "canvas", 4.5],
  ["on-accent", "accent", 4.5],
  ["ok", "canvas", 4.5],
  ["danger", "canvas", 4.5],
];

for (const [foreground, background, minimum] of pairs) {
  test(`--${foreground} on --${background} >= ${minimum}:1`, () => {
    const ratio = contrast(token(foreground), token(background));
    assert.ok(ratio >= minimum, `contrast is ${ratio.toFixed(2)}:1, needs ${minimum}:1`);
  });
}
