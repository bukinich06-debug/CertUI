import { createHash } from "crypto";

import { isProduction } from "@/lib/auth/constants";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

/*
* Кодирует в base64url
* @param input - Входное значение
* @returns Кодированное значение
*/
const base64UrlEncode = (input: Buffer) =>
  input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/*
* Создает код подтверждения
* @param codeVerifier - Код подтверждения
* @returns Код подтверждения
*/
export const createCodeChallenge = (codeVerifier: string) => {
  const digest = createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(digest);
};

/*
* Создает URL для авторизации через Google
* @param params - Параметры для создания URL
* @returns URL для авторизации через Google
*/
export const buildGoogleAuthUrl = (params: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}) => {
  const { state, codeChallenge, redirectUri } = params;
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", isProduction ? "consent" : "select_account");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
};

/*
* Обмен кода на токены
* @param params - Параметры для обмена кода на токены
* @returns Токены
*/
export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_at: Date | null;
  scope?: string;
  token_type?: string;
};

/*
* Обмен кода на токены
* @param params - Параметры для обмена кода на токены
* @returns Токены
*/
export const exchangeCodeForTokens = async (params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<GoogleTokens> => {
  const { code, codeVerifier, redirectUri } = params;
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to exchange code: ${response.status} ${errorBody}`);
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
  };

  const expires_at = json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null;

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    id_token: json.id_token,
    expires_at,
    scope: json.scope,
    token_type: json.token_type,
  };
};

/*
* Получает профиль пользователя из Google
* @param accessToken - Токен доступа
* @returns Профиль пользователя
*/
export type GoogleProfile = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

/*
* Получает профиль пользователя из Google
* @param accessToken - Токен доступа
* @returns Профиль пользователя
*/
export const fetchGoogleProfile = async (accessToken: string): Promise<GoogleProfile> => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch Google profile: ${response.status} ${errorBody}`);
  }

  const profile = (await response.json()) as GoogleProfile;
  if (!profile.sub) {
    throw new Error("Google profile does not contain sub");
  }

  return profile;
};

