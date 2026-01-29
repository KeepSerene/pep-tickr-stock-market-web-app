import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./lib/better-auth/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.svg (our specific favicon file)
     * - images (images folder in /public)
     * - sign-in / sign-up (auth pages)
     * - assets (assets folder in /public, if any)
     */
    "/((?!api|_next/static|_next/image|favicon.svg|images|sign-in|sign-up|assets).*)",
  ],
};
