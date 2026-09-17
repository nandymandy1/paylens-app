import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_HINT = "paylens_session_hint";

/** Fast proxy redirect only: the backend session stays the security boundary. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hint = request.cookies.get(SESSION_HINT)?.value;

  if (pathname.startsWith("/dashboard") && !hint) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.searchParams.set("redirect_to", `${pathname}${search}`);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
