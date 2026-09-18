import { releaseConfig } from "./release-config";
import type {
  ReleaseManifest,
  ReleaseState,
  ReleaseVerification,
} from "./release";

export type ReleaseSourceStatus =
  | "verified"
  | "confirmed"
  | "pinned"
  | "unavailable"
  | "invalid";

export type NormalizedRelease = {
  version: string;
  publishedAt: string;
  sizeBytes: number;
  sha256: string;
  signature: string;
  downloadUrl: string;
  releaseNotesUrl: string;
  channel: "stable";
  sourceStatus: Exclude<ReleaseSourceStatus, "unavailable" | "invalid">;
  sourceUrl: string;
  fileName: string;
  available: boolean;
  lastConfirmedAt: string;
  compatibility: ReleaseManifest["compatibility"];
  minimumUpdaterVersion: string;
};

export type NormalizedReleaseState =
  | { status: "ready"; release: NormalizedRelease }
  | {
      status: "unavailable";
      reason: string;
      sourceStatus: "unavailable" | "invalid";
    };

export function normalizeManifest(
  manifest: ReleaseManifest,
  sourceStatus: NormalizedRelease["sourceStatus"],
): NormalizedRelease {
  const signature =
    sourceStatus === "verified"
      ? `Ed25519 · ${manifest.keyId}`
      : sourceStatus === "pinned"
        ? "Закреплённый SHA-256"
        : "GitHub Release · SHA-256";

  return {
    version: manifest.version,
    publishedAt: manifest.publishedAt,
    sizeBytes: manifest.asset.size,
    sha256: manifest.asset.sha256,
    signature,
    downloadUrl: manifest.asset.url,
    releaseNotesUrl: manifest.releaseNotesUrl,
    channel: manifest.channel,
    sourceStatus,
    sourceUrl: `https://github.com/${releaseConfig.repository}/releases/tag/v${manifest.version}`,
    fileName: manifest.asset.fileName,
    available: manifest.available,
    lastConfirmedAt:
      sourceStatus === "pinned"
        ? releaseConfig.knownRelease.confirmedAt
        : new Date().toISOString(),
    compatibility: manifest.compatibility,
    minimumUpdaterVersion: manifest.minimumUpdaterVersion,
  };
}

export function normalizeReleaseState(
  state: ReleaseState,
): NormalizedReleaseState {
  if (state.status === "unavailable") {
    return {
      status: "unavailable",
      reason: state.reason,
      sourceStatus: state.integrityFailure ? "invalid" : "unavailable",
    };
  }

  const sourceStatus = sourceStatusFromVerification(state.verification);
  return {
    status: "ready",
    release: normalizeManifest(state.manifest, sourceStatus),
  };
}

export function sourceStatusFromVerification(
  verification: ReleaseVerification,
): NormalizedRelease["sourceStatus"] {
  return verification === "signed-manifest"
    ? "verified"
    : verification === "pinned-release"
      ? "pinned"
      : "confirmed";
}

export function releaseSourceLabel(
  sourceStatus: NormalizedRelease["sourceStatus"],
): string {
  return sourceStatus === "verified"
    ? "Подписанный manifest"
    : sourceStatus === "pinned"
      ? "Закреплённый проверенный пакет"
      : "Официальный GitHub Release";
}

export function compareReleaseVersions(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}
