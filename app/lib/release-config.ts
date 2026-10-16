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
    version: "0.3.0.99",
    publishedAt: "2026-10-16T14:42:14Z",
    confirmedAt: "2026-10-16T00:00:00Z",
    url: "https://github.com/MrPastio/monarch-releases/releases/tag/v0.3.0.99",
    assetUrl:
      "https://github.com/MrPastio/monarch-releases/releases/download/v0.3.0.99/Monarch-Setup-0.3.0.99.exe",
    assetSize: 724_933_985,
    assetSha256:
      "19398712c92f4af55b6672e94ce529c9c51b5cd0c4f805860132fdf34e22e3a6",
    fileName: "Monarch-Setup-0.3.0.99.exe",
  },
  /** Revoked by the stable channel; used if the signed manifest is unreachable. */
  knownRevoked: ["0.2.3.2", "0.2.3.3", "0.2.3.5"],
  mirrorManifestPath: "/api/releases/stable/manifest.json",
  mirrorSignaturePath: "/api/releases/stable/manifest.sig",
} as const;
