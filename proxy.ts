import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, negotiateLocale } from "./app/lib/i18n";

/**
 * Every human-facing page lives under a locale segment. Anything that arrives
 * without one is sent to the visitor's language, Russian by default.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    "/((?!api|_next|mascot|providers|brand|posters|og|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml|.*\\.[a-z0-9]{2,5}$).*)",
  ],
};
