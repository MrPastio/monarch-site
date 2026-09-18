import { cache } from "react";
import { normalizeReleaseState } from "./release-display";
import { getStableRelease } from "./release";

export const getNormalizedStableRelease = cache(async () =>
  normalizeReleaseState(await getStableRelease()),
);

