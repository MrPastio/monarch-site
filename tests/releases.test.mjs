import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = JSON.parse(readFileSync(join(root, "app/content/releases.snapshot.json"), "utf8"));
const notes = readFileSync(join(root, "app/content/release-notes.ts"), "utf8");
const config = readFileSync(join(root, "app/lib/release-config.ts"), "utf8");

const PREFIX = "https://github.com/MrPastio/monarch-releases/releases/download/";
const noteVersions = new Set([...notes.matchAll(/version: "([^"]+)",\n    status:/g)].map((m) => m[1]));
const display = (v) => (v.split(".").length === 4 && v.endsWith(".0") ? v.slice(0, -2) : v);

test("the built-in snapshot only points at official, hashed installers", () => {
  assert.ok(snapshot.releases.length >= 10);
  for (const release of snapshot.releases) {
    assert.match(release.version, /^\d+\.\d+\.\d+(\.\d+)?$/);
    assert.ok(release.asset, `${release.version} has no installer`);
    assert.ok(release.asset.url.startsWith(`${PREFIX}v${release.version}/`), `${release.version}: unexpected host`);
    assert.equal(release.asset.fileName, `Monarch-Setup-${release.version}.exe`);
    assert.match(release.asset.sha256, /^[a-f0-9]{64}$/);
    assert.ok(release.asset.size > 100_000_000);
  }
});

test("every published installer has release notes", () => {
  for (const release of snapshot.releases) {
    assert.ok(noteVersions.has(release.version) || noteVersions.has(display(release.version)), `no notes for ${release.version}`);
  }
});

test("known revocations are marked withdrawn in the notes", () => {
  const revoked = config.match(/knownRevoked: \[([^\]]+)\]/)[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1));
  assert.deepEqual(revoked.sort(), ["0.2.3.2", "0.2.3.3", "0.2.3.5"]);
  for (const version of revoked) {
    assert.match(notes, new RegExp(`version: "${version.replaceAll(".", "\.")}",\n    status: "withdrawn"`));
  }
});

test("the pinned fallback is the current stable release", () => {
  const latest = [...snapshot.releases].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  assert.match(config, new RegExp(`version: "${latest.version.replaceAll(".", "\.")}"`));
  assert.match(config, new RegExp(latest.asset.sha256));
});
