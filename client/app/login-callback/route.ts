import axios from "axios";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

const redirectToRoot = (queryParams: Record<string, string> = {}) => {
  let url = "/";
  const searchParams = new URLSearchParams(queryParams);
  const searchParamsStr = searchParams.toString();
  if (searchParamsStr) {
    url += `?${searchParamsStr}`;
  }
  return redirect(url.toString());
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const requestToken = searchParams.get("request_token");
  if (type !== "login" || status !== "success" || !requestToken) {
    return redirectToRoot();
  }

  let session;
  let sessionError: string;
  let sessionCookie: string;
  try {
    const res = await axios.post(`${process.env.SERVER_PRIVATE_URL}/api/auth/login/callback`, {
      request_token: requestToken,
    });
    session = res.data.kite_session;
    [sessionCookie] = res.headers["set-cookie"] ?? [];
  } catch (error: any) {
    console.error(error);
    console.log("here2");
    sessionError = error?.response?.data?.detail || error?.message || "Unknown error occuerd";
    return redirectToRoot({ error: sessionError });
  }

  if (!session.data.access_token) {
    redirectToRoot({ error: "access_token not found" });
  }

  if (!sessionCookie) {
    redirectToRoot({ error: "session cookie not found" });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/app/dashboard",
      "Set-Cookie": sessionCookie,
    },
  });
}
