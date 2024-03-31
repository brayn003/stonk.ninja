import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const reqCookie = request.headers.get("cookie");
  // get session and cookie-value from server
  let data, resCookie;
  const reqHeaders = new Headers();
  if (reqCookie) reqHeaders.set("cookie", reqCookie);
  const res = await fetch(`${process.env.SERVER_PRIVATE_URL}/api/session`, { headers: reqHeaders });
  if (res.ok) {
    resCookie = res.headers.get("set-cookie");
    data = await res.json();
  }

  // set cookie if session cookie is not present
  const headers = new Headers();
  if (resCookie) {
    headers.set("set-cookie", resCookie);
  }

  //  if user does not exist in session and route is private then redirect to home
  if (!data?.session?.user && request.nextUrl.pathname.startsWith("/private")) {
    headers.set("location", process.env.CLIENT_URL ?? "/");
    return new Response(null, { status: 302, headers });
  }
  // else continue
  return NextResponse.next({ headers });
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
