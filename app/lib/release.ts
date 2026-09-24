import { releaseConfig } from "./release-config";

export type ReleaseManifest = {
  schemaVersion: number;
  sequence: number;
  channel: "stable";
  version: string;
  publishedAt: string;
  expiresAt: string;
  minimumUpdaterVersion: string;
  minimumLauncherVersion: string;
  available: boolean;
  withdrawnReason: string | null;
  revokedVersions: string[];
  releaseNotesUrl: string;
  compatibility: {
    runtimeVersion: string;
    backendEnvironment: string;
    dataSchemaVersion: number;
    minimumReadableDataSchema: number;
    maximumReadableDataSchema: number;
    minimumModelCatalogSchema: number;
    maximumModelCatalogSchema: number;
  };
  asset: {
    url: string;
    mirrors: string[];
    size: number;
    sha256: string;
    fileName: string;
  };
  keyId: string;
};

export type ReleaseVerification =
  | "signed-manifest"
  | "github-release"
  | "pinned-release";

export type ReleaseState =
  | {
      status: "ready";
      manifest: ReleaseManifest;
      signatureAvailable: boolean;
      verification: ReleaseVerification;
    }
  | {
      status: "unavailable";
      reason: string;
      integrityFailure?: boolean;
      manifest?: ReleaseManifest;
      verification?: ReleaseVerification;
    };

export type ReleaseHistoryEntry = {
  manifest: ReleaseManifest;
  verification: Exclude<ReleaseVerification, "pinned-release">;
};

class ReleaseIntegrityError extends Error {
  constructor() {
    super("Release integrity verification failed.");
    this.name = "ReleaseIntegrityError";
  }
}

const RELEASE_PUBLIC_KEYS = {
  "monarch-release-2026-01": [
    "-----BEGIN PUBLIC KEY-----",
    "MCowBQYDK2VwAyEAc+A+0TWnG0GP/56r00f+lVMfdSKXAhek4xyRvWu6dCA=",
    "-----END PUBLIC KEY-----",
  ].join("\n"),
} as const;

const RELEASE_HOSTS = new Set([
  "github.com",
  "objects.githubusercontent.com",
  "github-releases.githubusercontent.com",
]);
const MAX_MANIFEST_BYTES = 128 * 1024;
const MAX_SIGNATURE_BYTES = 1024;
const RELEASE_FETCH_TIMEOUT_MS = 3_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeReleaseAsset(value: unknown): value is ReleaseManifest["asset"] {
  if (!isObject(value)) return false;
  if (
    typeof value.url !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.size !== "number" ||
    !Number.isSafeInteger(value.size) ||
    value.size <= 0 ||
    typeof value.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.sha256) ||
    !Array.isArray(value.mirrors)
  ) {
    return false;
  }

  try {
    const url = new URL(value.url);
    return url.protocol === "https:" && RELEASE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function parseReleaseManifest(value: unknown): ReleaseManifest | null {
  if (!isObject(value) || !isObject(value.compatibility)) return null;
  const compatibility = value.compatibility;
  const validCompatibility = [
    "dataSchemaVersion",
    "minimumReadableDataSchema",
    "maximumReadableDataSchema",
    "minimumModelCatalogSchema",
    "maximumModelCatalogSchema",
  ].every((key) => Number.isSafeInteger(compatibility[key]));

  if (
    value.schemaVersion !== 1 ||
    !Number.isSafeInteger(value.sequence) ||
    value.channel !== releaseConfig.channel ||
    typeof value.version !== "string" ||
    !/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(value.version) ||
    typeof value.publishedAt !== "string" ||
    Number.isNaN(Date.parse(value.publishedAt)) ||
    typeof value.expiresAt !== "string" ||
    Number.isNaN(Date.parse(value.expiresAt)) ||
    typeof value.minimumUpdaterVersion !== "string" ||
    typeof value.minimumLauncherVersion !== "string" ||
    typeof value.available !== "boolean" ||
    !(value.withdrawnReason === null || typeof value.withdrawnReason === "string") ||
    !Array.isArray(value.revokedVersions) ||
    !value.revokedVersions.every((item) => typeof item === "string") ||
    typeof value.releaseNotesUrl !== "string" ||
    typeof compatibility.runtimeVersion !== "string" ||
    typeof compatibility.backendEnvironment !== "string" ||
    !validCompatibility ||
    !isSafeReleaseAsset(value.asset) ||
    typeof value.keyId !== "string"
  ) {
    return null;
  }

  return value as ReleaseManifest;
}

function decodePem(pem: string): Uint8Array {
  const encoded = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");
  return decodeBase64(encoded);
}

function decodeBase64(value: string): Uint8Array {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new Error("Invalid Base64 release signature.");
  }
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function readBoundedBytes(
  response: Response,
  maximumBytes: number,
): Promise<Uint8Array> {
  const length = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > maximumBytes) {
    throw new Error("Release metadata exceeded its size limit.");
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maximumBytes) {
    throw new Error("Release metadata exceeded its size limit.");
  }
  return bytes;
}

async function verifyManifestBytes(
  manifestBytes: Uint8Array,
  signatureBytes: Uint8Array,
  manifest: ReleaseManifest,
): Promise<boolean> {
  const keyPem =
    RELEASE_PUBLIC_KEYS[manifest.keyId as keyof typeof RELEASE_PUBLIC_KEYS];
  if (!keyPem) return false;

  const signatureText = new TextDecoder("utf-8", { fatal: true })
    .decode(signatureBytes)
    .trim();
  const signature = decodeBase64(signatureText);
  if (signature.byteLength !== 64) return false;

  const publicKey = await crypto.subtle.importKey(
    "spki",
    exactArrayBuffer(decodePem(keyPem)),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    { name: "Ed25519" },
    publicKey,
    exactArrayBuffer(signature),
    exactArrayBuffer(manifestBytes),
  );
}

async function getSignedRelease(
  manifestUrl: string,
  signatureUrl: string,
): Promise<ReleaseManifest | null> {
  const [manifestResponse, signatureResponse] = await Promise.all([
    fetch(manifestUrl, {
      next: { revalidate: 900 },
      headers: { accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(RELEASE_FETCH_TIMEOUT_MS),
    }),
    fetch(signatureUrl, {
      next: { revalidate: 900 },
      headers: { accept: "text/plain, application/octet-stream" },
      redirect: "follow",
      signal: AbortSignal.timeout(RELEASE_FETCH_TIMEOUT_MS),
    }),
  ]);
  if (!manifestResponse.ok || !signatureResponse.ok) return null;

  const [manifestBytes, signatureBytes] = await Promise.all([
    readBoundedBytes(manifestResponse, MAX_MANIFEST_BYTES),
    readBoundedBytes(signatureResponse, MAX_SIGNATURE_BYTES),
  ]);
  let manifest: ReleaseManifest | null = null;
  try {
    manifest = parseReleaseManifest(
      JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(manifestBytes),
      ),
    );
  } catch {
    throw new ReleaseIntegrityError();
  }
  if (!manifest) throw new ReleaseIntegrityError();
  try {
    if (!(await verifyManifestBytes(manifestBytes, signatureBytes, manifest))) {
      throw new ReleaseIntegrityError();
    }
  } catch (error) {
    if (error instanceof ReleaseIntegrityError) throw error;
    throw new ReleaseIntegrityError();
  }
  if (Date.parse(manifest.expiresAt) <= Date.now()) {
    throw new ReleaseIntegrityError();
  }
  return manifest;
}

export async function getStableRelease(): Promise<ReleaseState> {
  try {
    const manifest = await getSignedRelease(
      releaseConfig.manifestUrl,
      releaseConfig.signatureUrl,
    );
    if (!manifest) {
      return (await getLatestGitHubRelease()) ?? getKnownRelease();
    }
    if (!manifest.available) {
      return {
        status: "unavailable",
        reason: manifest.withdrawnReason ?? "Раздача релиза приостановлена.",
        manifest,
        verification: "signed-manifest",
      };
    }

    return {
      status: "ready",
      manifest,
      signatureAvailable: true,
      verification: "signed-manifest",
    };
  } catch (error) {
    if (error instanceof ReleaseIntegrityError) {
      return {
        status: "unavailable",
        integrityFailure: true,
        reason:
          "Данные официального релиза не совпали с подписью. Загрузка отключена до повторной проверки.",
      };
    }
    return (await getLatestGitHubRelease()) ?? getKnownRelease();
  }
}

type GitHubReleaseAsset = {
  name?: unknown;
  browser_download_url?: unknown;
  size?: unknown;
  digest?: unknown;
};

type GitHubRelease = {
  draft?: unknown;
  prerelease?: unknown;
  tag_name?: unknown;
  published_at?: unknown;
  html_url?: unknown;
  assets?: unknown;
};

function getKnownRelease(): ReleaseState {
  const known = releaseConfig.knownRelease;
  return {
    status: "ready",
    signatureAvailable: false,
    verification: "pinned-release",
    manifest: {
      schemaVersion: 1,
      sequence: 0,
      channel: "stable",
      version: known.version,
      publishedAt: known.publishedAt,
      expiresAt: "2099-12-31T23:59:59Z",
      minimumUpdaterVersion: "0.1.0",
      minimumLauncherVersion: "0.1.0",
      available: true,
      withdrawnReason: null,
      revokedVersions: [],
      releaseNotesUrl: known.url,
      compatibility: {
        runtimeVersion: "bundled",
        backendEnvironment: "bundled",
        dataSchemaVersion: 0,
        minimumReadableDataSchema: 0,
        maximumReadableDataSchema: 0,
        minimumModelCatalogSchema: 0,
        maximumModelCatalogSchema: 0,
      },
      asset: {
        url: known.assetUrl,
        mirrors: [],
        size: known.assetSize,
        sha256: known.assetSha256,
        fileName: known.fileName,
      },
      keyId: "github-release-digest",
    },
  };
}

function directManifestForRelease(release: GitHubRelease): ReleaseManifest | null {
  if (
    release.draft === true ||
    release.prerelease === true ||
    typeof release.tag_name !== "string" ||
    !/^v\d+\.\d+\.\d+(?:\.\d+)?$/.test(release.tag_name) ||
    typeof release.published_at !== "string" ||
    Number.isNaN(Date.parse(release.published_at)) ||
    typeof release.html_url !== "string" ||
    !Array.isArray(release.assets)
  ) {
    return null;
  }

  const version = release.tag_name.slice(1);
  const fileName = `Monarch-Setup-${version}.exe`;
  const asset = (release.assets as GitHubReleaseAsset[]).find(
    (candidate) => candidate?.name === fileName,
  );
  if (
    typeof asset?.browser_download_url !== "string" ||
    typeof asset.size !== "number" ||
    !Number.isSafeInteger(asset.size) ||
    asset.size <= 0 ||
    typeof asset.digest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(asset.digest)
  ) {
    return null;
  }

  try {
    const assetUrl = new URL(asset.browser_download_url);
    const releaseUrl = new URL(release.html_url);
    const expectedPrefix = `/MrPastio/monarch-releases/releases/download/${release.tag_name}/`;
    if (
      assetUrl.protocol !== "https:" ||
      assetUrl.hostname !== "github.com" ||
      !assetUrl.pathname.startsWith(expectedPrefix) ||
      releaseUrl.protocol !== "https:" ||
      releaseUrl.hostname !== "github.com" ||
      !releaseUrl.pathname.startsWith("/MrPastio/monarch-releases/releases/tag/")
    ) {
      return null;
    }

    return {
      schemaVersion: 1,
      sequence: 0,
      channel: "stable",
      version,
      publishedAt: release.published_at,
      expiresAt: "2099-12-31T23:59:59Z",
      minimumUpdaterVersion: "0.1.0",
      minimumLauncherVersion: "0.1.0",
      available: true,
      withdrawnReason: null,
      revokedVersions: [],
      releaseNotesUrl: releaseUrl.href,
      compatibility: {
        runtimeVersion: "bundled",
        backendEnvironment: "bundled",
        dataSchemaVersion: 0,
        minimumReadableDataSchema: 0,
        maximumReadableDataSchema: 0,
        minimumModelCatalogSchema: 0,
        maximumModelCatalogSchema: 0,
      },
      asset: {
        url: assetUrl.href,
        mirrors: [],
        size: asset.size,
        sha256: asset.digest.slice("sha256:".length),
        fileName,
      },
      keyId: "github-release-digest",
    };
  } catch {
    return null;
  }
}

async function getLatestGitHubRelease(): Promise<ReleaseState | null> {
  try {
    const response = await fetch(releaseConfig.releasesApiUrl, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(RELEASE_FETCH_TIMEOUT_MS),
      headers: {
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      },
    });
    if (!response.ok) return null;
    const releases = await response.json();
    if (!Array.isArray(releases)) return null;
    for (const release of releases.slice(0, 20) as GitHubRelease[]) {
      const manifest = directManifestForRelease(release);
      if (manifest) {
        return {
          status: "ready",
          manifest,
          signatureAvailable: false,
          verification: "github-release",
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function signedAssetsForRelease(
  release: GitHubRelease,
): { manifestUrl: string; signatureUrl: string } | null {
  if (
    release.draft === true ||
    release.prerelease === true ||
    typeof release.tag_name !== "string" ||
    !/^v\d+\.\d+\.\d+(?:\.\d+)?$/.test(release.tag_name) ||
    !Array.isArray(release.assets)
  ) {
    return null;
  }
  const assets = release.assets as GitHubReleaseAsset[];
  const findAsset = (name: string) => {
    const asset = assets.find((candidate) => candidate?.name === name);
    if (typeof asset?.browser_download_url !== "string") return null;
    try {
      const url = new URL(asset.browser_download_url);
      return url.protocol === "https:" && url.hostname === "github.com"
        ? url.href
        : null;
    } catch {
      return null;
    }
  };
  const manifestUrl = findAsset("manifest.json");
  const signatureUrl = findAsset("manifest.sig");
  return manifestUrl && signatureUrl ? { manifestUrl, signatureUrl } : null;
}

export async function getReleaseHistory(): Promise<ReleaseHistoryEntry[]> {
  try {
    const response = await fetch(releaseConfig.releasesApiUrl, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(RELEASE_FETCH_TIMEOUT_MS),
      headers: {
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      },
    });
    if (!response.ok) return [];
    const value = await response.json();
    if (!Array.isArray(value)) return [];

    const verified = await Promise.all(
      value.slice(0, 20).map(async (release: GitHubRelease) => {
        const assets = signedAssetsForRelease(release);
        if (!assets) return null;
        try {
          const manifest = await getSignedRelease(
            assets.manifestUrl,
            assets.signatureUrl,
          );
          return manifest
            ? { manifest, verification: "signed-manifest" as const }
            : null;
        } catch {
          return null;
        }
      }),
    );
    const byVersion = new Map<string, ReleaseHistoryEntry>();
    const direct = (value as GitHubRelease[])
      .map(directManifestForRelease)
      .filter((manifest): manifest is ReleaseManifest => Boolean(manifest))
      .map((manifest) => ({
        manifest,
        verification: "github-release" as const,
      }));
    for (const entry of [...verified, ...direct]) {
      if (!entry) continue;
      const current = byVersion.get(entry.manifest.version);
      if (
        !current ||
        entry.manifest.sequence > current.manifest.sequence ||
        (entry.manifest.sequence === current.manifest.sequence &&
          entry.verification === "signed-manifest" &&
          current.verification !== "signed-manifest")
      ) {
        byVersion.set(entry.manifest.version, entry);
      }
    }
    return [...byVersion.values()].sort(
      (left, right) =>
        Date.parse(right.manifest.publishedAt) -
        Date.parse(left.manifest.publishedAt),
    );
  } catch {
    return [];
  }
}

export function formatBytes(bytes: number): string {
  const units = ["Б", "КБ", "МБ", "ГБ"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: unitIndex > 1 ? 1 : 0,
  }).format(value)} ${units[unitIndex]}`;
}

export function formatReleaseDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
