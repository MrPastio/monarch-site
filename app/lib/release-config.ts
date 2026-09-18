export const releaseConfig = {
  repository: "MrPastio/monarch-releases",
  channel: "stable",
  manifestUrl:
    "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.json",
  signatureUrl:
    "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.sig",
  releasesApiUrl:
    "https://api.github.com/repos/MrPastio/monarch-releases/releases?per_page=20",
  knownRelease: {
    version: "0.2.3.4",
    publishedAt: "2026-07-23T01:27:16Z",
    confirmedAt: "2026-07-23T01:27:16Z",
    url: "https://github.com/MrPastio/monarch-releases/releases/tag/v0.2.3.4",
    assetUrl:
      "https://github.com/MrPastio/monarch-releases/releases/download/v0.2.3.4/Monarch-Setup-0.2.3.4.exe",
    assetSize: 731_437_538,
    assetSha256:
      "f3f3017e83d58e5ad24d5a69b16eb8bc3dc9707d9a448c022588e02bea3d81b5",
    fileName: "Monarch-Setup-0.2.3.4.exe",
  },
  mirrorManifestPath: "/api/releases/stable/manifest.json",
  mirrorSignaturePath: "/api/releases/stable/manifest.sig",
} as const;
