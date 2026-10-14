import { cache } from "react";
import snapshot from "@/content/releases.snapshot.json";
import { findProductUpdate, type ProductUpdate } from "@/content/release-notes";
import { releaseConfig } from "./release-config";
import { getStableRelease, type ReleaseState } from "./release";

export type ReleaseAsset = {
  fileName: string;
  url: string;
  size: number;
  sha256: string;
};

export type CatalogEntry = {
  /** Exact package version, e.g. 0.2.5.0. */
  version: string;
  /** What people see, e.g. 0.2.5. */
  display: string;
  publishedAt: string | null;
  releaseUrl: string | null;
  asset: ReleaseAsset | null;
  state: "current" | "archive" | "revoked" | "history";
  notes: ProductUpdate | null;
  /**
   * Every published build of this version, newest first. A patch (0.3.0.97 →
   * 0.3.0.98) does not get its own entry: the version quietly points at the
   * newest build, and the older ones stay installable from the Patches tab.
   */
  patches: PatchBuild[];
};

export type PatchBuild = Pick<CatalogEntry, "version" | "display" | "publishedAt" | "releaseUrl" | "asset"> & {
  state: "current" | "archive" | "revoked";
};

export type ReleaseCatalog = {
  current: CatalogEntry | null;
  stable: ReleaseState;
  entries: CatalogEntry[];
  source: "github" | "snapshot";
  revoked: readonly string[];
};

type SnapshotRelease = (typeof snapshot.releases)[number];

const EXPECTED_PREFIX = "https://github.com/MrPastio/monarch-releases/releases/download/";

export function displayVersion(version: string): string {
  const parts = version.split(".");
  return parts.length === 4 && parts[3] === "0" ? parts.slice(0, 3).join(".") : version;
}

export function compareVersions(left: string, right: string): number {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function parseGitHub(value: unknown): SnapshotRelease[] | null {
  if (!Array.isArray(value)) return null;
  const out: SnapshotRelease[] = [];
  for (const release of value as Record<string, unknown>[]) {
    if (release.draft === true || release.prerelease === true) continue;
    const tag = release.tag_name;
    if (typeof tag !== "string" || !/^v\d+\.\d+\.\d+(?:\.\d+)?$/.test(tag)) continue;
    const version = tag.slice(1);
    const assets = Array.isArray(release.assets) ? (release.assets as Record<string, unknown>[]) : [];
    const raw = assets.find((asset) => asset.name === `Monarch-Setup-${version}.exe`);
    let asset: ReleaseAsset | null = null;
    if (
      raw &&
      typeof raw.browser_download_url === "string" &&
      raw.browser_download_url.startsWith(EXPECTED_PREFIX) &&
      typeof raw.size === "number" &&
      typeof raw.digest === "string" &&
      /^sha256:[a-f0-9]{64}$/.test(raw.digest)
    ) {
      asset = {
        fileName: String(raw.name),
        url: raw.browser_download_url,
        size: raw.size,
        sha256: raw.digest.slice(7),
      };
    }
    out.push({
      version,
      tag,
      publishedAt: typeof release.published_at === "string" ? release.published_at : "",
      releaseUrl: typeof release.html_url === "string" ? release.html_url : "",
      asset,
    } as SnapshotRelease);
  }
  return out.length ? out : null;
}

async function fetchReleases(): Promise<{ releases: SnapshotRelease[]; source: "github" | "snapshot" }> {
  try {
    const response = await fetch(releaseConfig.releasesApiUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4_000),
      headers: {
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (response.ok) {
      const parsed = parseGitHub(await response.json());
      if (parsed) return { releases: parsed, source: "github" };
    }
  } catch {
    // fall through to the snapshot
  }
  return { releases: snapshot.releases, source: "snapshot" };
}

/**
 * Every Monarch version in one list: published installers from GitHub
 * (live, with a built-in snapshot as fallback), revocations from the signed
 * stable channel, and the product history for older versions without an
 * installer.
 */
export const getReleaseCatalog = cache(async (): Promise<ReleaseCatalog> => {
  const [stable, { releases, source }] = await Promise.all([getStableRelease(), fetchReleases()]);
  const signed = stable.status === "ready" && stable.verification === "signed-manifest" ? stable.manifest : null;
  const revoked: readonly string[] = signed?.revokedVersions.length ? signed.revokedVersions : releaseConfig.knownRevoked;
  const currentVersion = stable.status === "ready" ? stable.manifest.version : null;

  const entries = new Map<string, CatalogEntry>();
  for (const group of groupBuilds(releases, revoked, currentVersion)) {
    entries.set(group.version, group);
  }

  // Older versions that shipped before the public release channel existed.
  const { productUpdates } = await import("@/content/release-notes");
  for (const update of productUpdates) {
    if (update.status === "draft") continue;
    const known = [...entries.values()].some((entry) => entry.notes === update || entry.display === update.version);
    if (known) continue;
    entries.set(update.version, {
      version: update.version,
      display: displayVersion(update.version),
      publishedAt: "publishedOn" in update ? update.publishedOn : null,
      releaseUrl: null,
      asset: null,
      state: "history",
      notes: update,
      patches: [],
    });
  }

  const sorted = [...entries.values()].sort((a, b) => compareVersions(b.version, a.version));
  const current =
    sorted.find((entry) => entry.state === "current") ??
    sorted.find((entry) => entry.state === "archive" && entry.asset) ??
    null;
  if (current && current.state !== "current") current.state = "current";

  return { current, stable, entries: sorted, source, revoked };
});

/**
 * One catalog entry per version line: builds that share release notes (the
 * 0.3.0.N patches) collapse into the newest usable one. Builds without notes
 * stay separate, exactly as before.
 */
export function groupBuilds(
  releases: readonly SnapshotRelease[],
  revoked: readonly string[],
  currentVersion: string | null,
): CatalogEntry[] {
  const groups = new Map<string, PatchBuild[]>();
  const notesByKey = new Map<string, ProductUpdate | null>();
  for (const release of releases) {
    const notes = findProductUpdate(release.version);
    const key = notes ? `notes:${notes.version}` : `build:${release.version}`;
    const build: PatchBuild = {
      version: release.version,
      display: displayVersion(release.version),
      publishedAt: release.publishedAt || null,
      releaseUrl: release.releaseUrl || null,
      asset: release.asset,
      state: revoked.includes(release.version) ? "revoked" : release.version === currentVersion ? "current" : "archive",
    };
    groups.set(key, [...(groups.get(key) ?? []), build]);
    notesByKey.set(key, notes);
  }
  const out: CatalogEntry[] = [];
  for (const [key, builds] of groups) {
    const patches = [...builds].sort((a, b) => compareVersions(b.version, a.version));
    // The version points at the build the channel serves, else the newest usable one.
    const lead =
      patches.find((build) => build.state === "current") ??
      patches.find((build) => build.state !== "revoked" && build.asset) ??
      patches[0]!;
    out.push({
      ...lead,
      notes: notesByKey.get(key) ?? null,
      patches: patches.length > 1 ? patches : [],
    });
  }
  return out;
}

export function findCatalogEntry(catalog: ReleaseCatalog, slug: string): CatalogEntry | null {
  return (
    catalog.entries.find((entry) => entry.version === slug) ??
    catalog.entries.find((entry) => entry.display === slug) ??
    // An older patch link still opens its version.
    catalog.entries.find((entry) => entry.patches.some((build) => build.version === slug || build.display === slug)) ??
    // The line itself (0.3 or 0.3.0) opens its newest build.
    catalog.entries.find((entry) => entry.notes
      && (entry.notes.version === slug || entry.notes.version.replace(/\.0$/, "") === slug)) ??
    null
  );
}
