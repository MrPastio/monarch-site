/** Formatting helpers shared by the release UI. Locale-aware, no rounding lies. */

/**
 * Binary megabytes, because that is what Windows shows the visitor in the
 * file properties. 727 372 610 bytes → "693,7 МБ", matching the release notes.
 */
export function formatBytes(bytes: number, locale = "ru-RU"): string {
  const megabytes = bytes / 1024 / 1024;
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString(locale, {
      maximumFractionDigits: 2,
    })} ГБ`;
  }
  return `${megabytes.toLocaleString(locale, {
    maximumFractionDigits: 1,
  })} МБ`;
}

export function formatDate(iso: string, locale = "ru-RU"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** 0.2.5.0 → 0.2.5 — the site shows three segments, never the build tail. */
export function displayVersion(version: string): string {
  const parts = version.split(".");
  return parts.length > 3 ? parts.slice(0, 3).join(".") : version;
}
