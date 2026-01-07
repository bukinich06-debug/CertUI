import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/constants";
import { deleteSessionByToken } from "@/lib/auth/session";
import { NextResponse } from "next/server";

const buildRedirect = (req: Request, path = "/auth") => {
  const url = new URL(req.url);
  return new URL(path, url.origin).toString();
};

const handleLogout = async (req: Request) => {
  const requestCookies = req.headers.get("cookie") ?? "";
  const sessionCookie = requestCookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`));
  const sessionToken = sessionCookie?.split("=")[1];

  if (sessionToken) await deleteSessionByToken(sessionToken);
  
  const response = NextResponse.redirect(buildRedirect(req));
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
};

export const GET = handleLogout;
export const POST = handleLogout;

