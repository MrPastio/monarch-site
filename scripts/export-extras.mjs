/**
 * Finishing touches for the static (GitHub Pages) build:
 * - out/index.html sends visitors to their language, Russian by default;
 * - out/.nojekyll keeps the _next folder visible to Pages;
 * - segment-prefetch payloads are also written under the flat names the
 *   client router requests (`__next.$d$lang.download.txt`), because the
 *   static exporter nests them in folders and a plain file host has no
 *   rewrite to bridge the two.
 */
import { copyFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const out = "out";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Monarch</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#faf8f4">
<link rel="icon" href="${base}/icon.svg">
<meta http-equiv="refresh" content="0; url=${base}/ru/">
<script>
(function () {
  var supported = ["ru", "uk", "en", "bg"];
  var pick = "ru";
  var langs = navigator.languages || [navigator.language || "ru"];
  for (var i = 0; i < langs.length; i++) {
    var code = String(langs[i]).toLowerCase().split("-")[0];
    if (supported.indexOf(code) !== -1) { pick = code; break; }
    if (code === "be" || code === "kk") { pick = "ru"; break; }
  }
  location.replace("${base}/" + pick + "/");
})();
</script>
<style>html{background:#faf8f4}</style>
</head>
<body></body>
</html>
`;
writeFileSync(join(out, "index.html"), html);
writeFileSync(join(out, ".nojekyll"), "");

let flattened = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(dir, path);
    else if (name !== "_next") walk(path);
  }
}

/** `<page>/__next.X/a/b.txt` → `<page>/__next.X.a.b.txt` */
function flatten(pageDir, segmentDir) {
  const stack = [segmentDir];
  while (stack.length) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) {
        stack.push(path);
        continue;
      }
      const flat = relative(pageDir, path).split(sep).join(".");
      copyFileSync(path, join(pageDir, flat));
      flattened += 1;
    }
  }
}

walk(out);
console.log(`export extras written for base ${base || "/"}; ${flattened} prefetch payloads flattened`);
