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
    version: "0.2.5.0",
    publishedAt: "2026-08-25T12:05:30Z",
    confirmedAt: "2026-09-25T00:00:00Z",
    url: "https://github.com/MrPastio/monarch-releases/releases/tag/v0.2.5.0",
    assetUrl:
      "https://github.com/MrPastio/monarch-releases/releases/download/v0.2.5.0/Monarch-Setup-0.2.5.0.exe",
    assetSize: 727_372_610,
    assetSha256:
      "4d113be01f6cc5f1b480753616d77b2e8203ddae9f455caa2b9a28ed0c755d87",
    fileName: "Monarch-Setup-0.2.5.0.exe",
  },
  /** Revoked by the stable channel; used if the signed manifest is unreachable. */
  knownRevoked: ["0.2.3.2", "0.2.3.3", "0.2.3.5"],
  mirrorManifestPath: "/api/releases/stable/manifest.json",
  mirrorSignaturePath: "/api/releases/stable/manifest.sig",
} as const;
