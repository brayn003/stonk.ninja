import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // get session and cookie-value from server
  let data, cookieVal;
  try {
    const res = await fetch(`${process.env.SERVER_PRIVATE_URL}/api/session`);
    cookieVal = res.headers.get("set-cookie");
    data = await res.json();
  } catch (err) {
    cookieVal = null;
  }

  // set cookie if session cookie is not present
  const session = request.cookies.get("session")?.value;
  const headers = new Headers();
  if (!session && cookieVal) {
    headers.set("set-cookie", cookieVal);
  }

  //  if user does not exist in session and route is private then redirect to home
  if (!data.user && request.nextUrl.pathname.startsWith("/private")) {
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
