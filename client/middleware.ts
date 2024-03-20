import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  console.log("middleware in", request.url);

  if (!session && request.nextUrl.pathname.startsWith("/private")) {
    return Response.redirect(new URL("/", request.url));
  }

  //   if (session && !request.nextUrl.pathname.startsWith("/dashboard")) {
  //     return Response.redirect(new URL("/dashboard", request.url));
  //   }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|static|.*\\..*|_next).*)",
  ],
};
