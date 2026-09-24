/**
 * Public-folder URLs. The site can be served from a sub-path (GitHub Pages
 * serves it under /monarch-site); next/link adds the base path itself, but
 * plain image and CSS URLs need it spelled out.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${basePath}${path}`;
}
