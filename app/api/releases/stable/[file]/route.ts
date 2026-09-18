const RELEASE_FILES = {
  "manifest.json": {
    upstream:
      "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.json",
    contentType: "application/json; charset=utf-8",
    maximumBytes: 256 * 1024,
  },
  "manifest.sig": {
    upstream:
      "https://raw.githubusercontent.com/MrPastio/monarch-releases/main/channels/stable/manifest.sig",
    contentType: "text/plain; charset=us-ascii",
    maximumBytes: 1024,
  },
} as const;

export const dynamic = "force-dynamic";

type ReleaseFile = keyof typeof RELEASE_FILES;

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (!(file in RELEASE_FILES)) {
    return new Response("Not found", { status: 404 });
  }

  const contract = RELEASE_FILES[file as ReleaseFile];
  try {
    const upstream = await fetch(contract.upstream, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(3_000),
      headers: {
        accept:
          file === "manifest.json"
            ? "application/json"
            : "text/plain, application/octet-stream",
      },
    });
    if (!upstream.ok) {
      return new Response("Stable channel is unavailable", { status: 503 });
    }

    const declaredLength = Number(upstream.headers.get("content-length") ?? "0");
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > contract.maximumBytes
    ) {
      return new Response("Stable channel metadata is invalid", { status: 502 });
    }
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > contract.maximumBytes) {
      return new Response("Stable channel metadata is invalid", { status: 502 });
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        "content-type": contract.contentType,
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Stable channel is unavailable", { status: 503 });
  }
}
