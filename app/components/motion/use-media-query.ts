"use client";

import { useEffect, useState } from "react";

/**
 * Starts false on the server and on first paint, then settles. Callers must
 * treat the wide/animated layout as the default so nothing depends on this
 * value being correct before hydration.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
