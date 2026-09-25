import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(join(root, relative), "utf8");

const claimsSource = read("app/content/claims.ts");
const locales = ["ru", "uk", "en", "bg"];
const sources = Object.fromEntries(locales.map((locale) => [locale, read(`app/content/${locale}.ts`)]));

/** Only the human-facing strings, not the code around them. */
const strings = (source) => [...source.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((match) => match[1]);

/**
 * The truth contract. These tests are the reason the copy can be trusted:
 * they fail the build rather than let a comfortable sentence through.
 */
test("every registered claim carries evidence", () => {
  const blocks = claimsSource.split(/\n  (?=\w+: \{)/).slice(1);
  assert.ok(blocks.length >= 10, "expected the claim registry to be populated");
  for (const block of blocks) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    assert.ok(id, `claim block without an id:\n${block.slice(0, 120)}`);
    const evidence = block.match(/evidence:\s*"([^"]+)"/)?.[1];
    assert.ok(evidence && evidence.length > 3, `claim "${id}" has no evidence`);
  }
});

test("claims referenced by any locale exist in the registry", () => {
  const registered = new Set([...claimsSource.matchAll(/^  (\w+): \{$/gm)].map((match) => match[1]));
  for (const locale of locales) {
    const referenced = [...sources[locale].matchAll(/claim: "(\w+)"/g)].map((m) => m[1]);
    assert.ok(referenced.length > 0, `${locale}: the copy references no claims`);
    for (const id of referenced) assert.ok(registered.has(id), `${locale}: unknown claim "${id}"`);
  }
});

// "100%" is allowed only when quoted — i.e. when the copy talks about the rule itself.
const hundred = /(?<![«“"„])\b100\s*%/;

const forbidden = {
  ru: [
    [/подписанн?(ое|ый|о)\s+приложени|подписанн?ый\s+установщик/i, "Authenticode отсутствует"],
    [/(?<!не\s)замен(а|яет|ит)\s+антивирус|(?<!не\s)вместо\s+антивирус/i, "Security — не антивирус"],
    [hundred, "абсолютных гарантий нет"],
    [/полностью\s+безопасн|гарантиру/i, "абсолютных гарантий нет"],
    [/мгновенн|без\s+задержек/i, "скорость зависит от железа"],
    [/революц|прорыв|лучший\s+в\s+мире/i, "непроверяемая превосходная степень"],
    [/работает\s+полностью\s+офлайн|совсем\s+без\s+интернета/i, "нужна сеть для обновлений"],
  ],
  uk: [
    [/підписан(ий|е)\s+інсталятор/i, "Authenticode відсутній"],
    [/(?<!не\s)замін(ює|ить)\s+антивірус/i, "Security — не антивірус"],
    [hundred, "абсолютних гарантій немає"],
    [/повністю\s+безпечн|гаранту/i, "абсолютних гарантій немає"],
    [/миттєв/i, "швидкість залежить від заліза"],
  ],
  en: [
    [/signed\s+installer|signed\s+app/i, "no Authenticode"],
    [/(?<!not\s)(?<!rather than\s)replac(es|ing)\s+(your\s+)?antivirus/i, "Security is not an antivirus"],
    [hundred, "no absolute guarantees"],
    [/completely\s+safe|guarantee/i, "no absolute guarantees"],
    [/instant(ly)?\b|zero\s+latency/i, "speed depends on hardware"],
    [/revolutionar|best\s+in\s+the\s+world/i, "unverifiable superlative"],
    [/fully\s+offline|works\s+entirely\s+offline/i, "updates need the network"],
  ],
  bg: [
    [/подписан\s+инсталатор/i, "няма Authenticode"],
    [/(?<!не\s)замества\s+антивирус/i, "Security не е антивирус"],
    [hundred, "няма абсолютни гаранции"],
    [/напълно\s+безопас|гарантира/i, "няма абсолютни гаранции"],
    [/мигновен/i, "скоростта зависи от хардуера"],
  ],
};

for (const locale of locales) {
  test(`${locale}: forbidden wording does not appear`, () => {
    const text = strings(sources[locale]).join("\n");
    for (const [pattern, because] of forbidden[locale]) {
      const hit = text.match(pattern);
      assert.equal(hit, null, `forbidden wording ${pattern} (${because}): "${hit?.[0]}"`);
    }
  });

  test(`${locale}: the copy never prints the four-segment build version`, () => {
    for (const value of strings(sources[locale])) {
      // The exact EXE file name is the one allowed exception.
      if (value.includes("Monarch-Setup")) continue;
      // Loopback addresses are not versions.
      const text = value.replaceAll("127.0.0.1", "");
      assert.equal(/\b\d+\.\d+\.\d+\.\d+\b/.test(text), false, `copy shows a build version: "${value}"`);
    }
  });

  test(`${locale}: unreleased work is labelled as such`, () => {
    const maxKicker = sources[locale].match(/max: \{\s*index: "\d\d",\s*kicker: "([^"]+)"/)?.[1];
    assert.ok(maxKicker && /0\.3/.test(maxKicker), `${locale}: MAX must be marked as 0.3 / in development`);
  });
}
