export const releaseConfig = {
  repository: "MrPastio/monarch-releases",
  channel: "stable",
  manifestUrl:
    "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.json",
  signatureUrl:
    "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.sig",
  releasesApiUrl:
    "https://api.github.com/repos/MrPastio/monarch-releases/releases?per_page=30",
  /** Last release confirmed by hand; used only if GitHub is unreachable. */
  knownRelease: {
    version: "0.3.0.98",
    publishedAt: "2026-10-14T13:51:18Z",
    confirmedAt: "2026-10-14T00:00:00Z",
    url: "https://github.com/MrPastio/monarch-releases/releases/tag/v0.3.0.98",
    assetUrl:
      "https://github.com/MrPastio/monarch-releases/releases/download/v0.3.0.98/Monarch-Setup-0.3.0.98.exe",
    assetSize: 726_147_812,
    assetSha256:
      "0539853e2f8f0c5ce0f17063af82d870f88b65dc2e2f0b4ed074b0bf8080bcd4",
    fileName: "Monarch-Setup-0.3.0.98.exe",
  },
  /** Revoked by the stable channel; used if the signed manifest is unreachable. */
  knownRevoked: ["0.2.3.2", "0.2.3.3", "0.2.3.5"],
  mirrorManifestPath: "/api/releases/stable/manifest.json",
  mirrorSignaturePath: "/api/releases/stable/manifest.sig",
} as const;
