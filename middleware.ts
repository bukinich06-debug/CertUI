import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/main", "/certs"];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const validateUrl = new URL("/api/auth/me", request.url);
  const validationResponse = await fetch(validateUrl, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!validationResponse.ok) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/main/:path*", "/certs/:path*"],
};
