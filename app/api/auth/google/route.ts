import crypto from "crypto";
import { NextResponse } from "next/server";

import { buildGoogleAuthUrl, createCodeChallenge } from "@/lib/auth/google";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_VERIFIER_COOKIE = "oauth_verifier";
const isProduction = process.env.NODE_ENV === "production";

const temporaryCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
  maxAge: 10 * 60, // 10 minutes
};

export const GET = async (req: Request) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google OAuth не настроен" }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallenge = createCodeChallenge(codeVerifier);

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();
  const authUrl = buildGoogleAuthUrl({ state, codeChallenge, redirectUri });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, temporaryCookieOptions);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, temporaryCookieOptions);

  return response;
};

