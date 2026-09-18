import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(join(root, relative), "utf8");

const claimsSource = read("app/content/claims.ts");
const ruSource = read("app/content/ru.ts");

/**
 * The truth contract. These tests are the reason the copy can be trusted:
 * they fail the build rather than let a comfortable sentence through.
 */

test("every registered claim carries evidence", () => {
  // Each `id:` entry in the registry must be followed by an `evidence:` line.
  const blocks = claimsSource.split(/\n  (?=\w+: \{)/).slice(1);
  assert.ok(blocks.length >= 8, "expected the claim registry to be populated");

  for (const block of blocks) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    assert.ok(id, `claim block without an id:\n${block.slice(0, 120)}`);
    const evidence = block.match(/evidence: "([^"]+)"/)?.[1];
    assert.ok(evidence && evidence.length > 3, `claim "${id}" has no evidence`);
  }
});

test("claims referenced by the copy exist in the registry", () => {
  const registered = new Set(
    [...claimsSource.matchAll(/^  (\w+): \{$/gm)].map((match) => match[1]),
  );
  const referenced = [...ruSource.matchAll(/claim: "(\w+)"/g)].map((m) => m[1]);

  assert.ok(referenced.length > 0, "the copy references no claims at all");
  for (const id of referenced) {
    assert.ok(registered.has(id), `copy references unknown claim "${id}"`);
  }
});

test("forbidden wording does not appear in the Russian copy", () => {
  // Kept in sync with forbiddenWording in app/content/claims.ts.
  const forbidden = [
    [/подписанн?(ое|ый|о)\s+приложени|подписанн?ый\s+установщик/i, "Authenticode отсутствует"],
    // Lookbehind keeps honest denials ("не заменяет антивирус") legal.
    [/(?<!не\s)замен(а|яет|ит)\s+антивирус|(?<!не\s)вместо\s+антивирус/i, "Security — не антивирус"],
    [/\b100\s*%|\bполностью\s+безопасн|\bгарантиру/i, "абсолютных гарантий нет"],
    [/\bмгновенн|\bбез\s+задержек/i, "скорость зависит от железа"],
    [/революц|прорыв|лучший\s+в\s+мире/i, "непроверяемая превосходная степень"],
    [/работает\s+полностью\s+офлайн|совсем\s+без\s+интернета/i, "нужна сеть для обновлений"],
  ];

  // Only the human-facing strings, not the code around them.
  const strings = [...ruSource.matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((match) => match[1])
    .join("\n");

  for (const [pattern, because] of forbidden) {
    const hit = strings.match(pattern);
    assert.equal(hit, null, `forbidden wording ${pattern} (${because}): "${hit?.[0]}"`);
  }
});

test("the site never prints the four-segment build version", () => {
  const strings = [...ruSource.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  for (const value of strings) {
    // The exact EXE file name is the one allowed exception.
    if (value.includes("Monarch-Setup")) continue;
    assert.equal(
      /\b\d+\.\d+\.\d+\.\d+\b/.test(value),
      false,
      `copy shows a build version: "${value}"`,
    );
  }
});

test("every capability states its limit", () => {
  const capabilities = ruSource
    .split(/\n      \{\n        id: "/)
    .slice(1)
    .filter((block) => block.includes("maturity:"));

  assert.ok(capabilities.length >= 6, "expected six capabilities");
  for (const block of capabilities) {
    const id = block.slice(0, block.indexOf('"'));
    // The value may be wrapped onto the next line by the formatter.
    assert.match(block, /limit:\s*"[^"]{10,}/, `capability "${id}" has no limit`);
  }
});
