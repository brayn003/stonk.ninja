import axios from "axios";
import { cookies } from "next/headers";
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
  try {
    const res = await axios.post(`${process.env.SERVER_URL}/api/auth/login/callback`, {
      request_token: requestToken,
    });
    session = res.data.session;
  } catch (error: any) {
    console.error(error);
    sessionError = error?.message || "Unknown error occuerd";
    return redirectToRoot({ error: sessionError });
  }

  if (!session.data.access_token) {
    redirectToRoot({ error: "access_token not found" });
  }

  cookies().set("session", session.sess_id as string);
  return redirect("/app/dashboard");
}
