import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/constants";
import { exchangeCodeForTokens, fetchGoogleProfile } from "@/lib/auth/google";
import { createSession, deleteSessionByToken, getClientIp } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_VERIFIER_COOKIE = "oauth_verifier";

const resolveRedirect = (req: Request, fallbackPath = "/main") => {
  const url = new URL(req.url);
  const origin = url.origin;
  const target = process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? fallbackPath;
  return new URL(target, origin).toString();
};

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${resolveRedirect(req, "/auth")}?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${resolveRedirect(req, "/auth")}?error=missing_code`);
  }

  const requestCookies = req.headers.get("cookie") ?? "";
  const stateCookie = requestCookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${OAUTH_STATE_COOKIE}=`));
  const verifierCookie = requestCookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${OAUTH_VERIFIER_COOKIE}=`));

  const storedState = stateCookie?.split("=")[1];
  const codeVerifier = verifierCookie?.split("=")[1];

  if (!storedState || !codeVerifier || storedState !== state) {
    return NextResponse.redirect(`${resolveRedirect(req, "/auth")}?error=state_mismatch`);
  }

  try {
    const redirectUri = new URL("/api/auth/google/callback", req.url).toString();
    const tokens = await exchangeCodeForTokens({ code, codeVerifier, redirectUri });
    const profile = await fetchGoogleProfile(tokens.access_token);

    const existingAccount = await prisma.oauth_accounts.findUnique({
      where: { provider_provider_user_id: { provider: "google", provider_user_id: profile.sub } },
      include: { user: true },
    });

    const email = profile.email ?? existingAccount?.email_at_provider ?? null;
    const name = profile.name ?? existingAccount?.user.name ?? null;
    const avatar = profile.picture ?? existingAccount?.user.avatar_url ?? null;

    let userId: bigint;

    if (existingAccount) {
      userId = existingAccount.user_id;
    } else if (email) {
      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const created = await prisma.users.create({
          data: {
            email,
            name,
            avatar_url: avatar,
          },
        });
        userId = created.id;
      }
    } else {
      const created = await prisma.users.create({
        data: {
          name,
          avatar_url: avatar,
        },
      });
      userId = created.id;
    }

    await prisma.oauth_accounts.upsert({
      where: { provider_provider_user_id: { provider: "google", provider_user_id: profile.sub } },
      update: {
        user_id: userId,
        email_at_provider: email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expires_at,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        provider: "google",
        provider_user_id: profile.sub,
        email_at_provider: email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expires_at,
      },
    });

    // Clean up previous session if any
    const sessionCookie = requestCookies
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`));
    const previousSessionToken = sessionCookie?.split("=")[1];
    if (previousSessionToken) {
      await deleteSessionByToken(previousSessionToken);
    }

    const { token: sessionToken, expiresAt } = await createSession({
      userId,
      userAgent: req.headers.get("user-agent"),
      ip: await getClientIp(req),
    });

    const response = NextResponse.redirect(resolveRedirect(req, "/main"));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      ...sessionCookieOptions,
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    });
    response.cookies.set(OAUTH_STATE_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
    response.cookies.set(OAUTH_VERIFIER_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });

    return response;
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return NextResponse.redirect(`${resolveRedirect(req, "/auth")}?error=oauth_failed`);
  }
};

