import type { GenericOAuthConfig } from "better-auth/plugins";
import { env } from "@/lib/env";

type GenericOAuthTokens = Parameters<NonNullable<GenericOAuthConfig["getUserInfo"]>>[0];
type GenericOAuthGetTokenParams = Parameters<NonNullable<GenericOAuthConfig["getToken"]>>[0];

export function getMailruProvider(isEnabled: boolean): GenericOAuthConfig | null {
  if (!isEnabled || !env.MAILRU_CLIENT_ID || !env.MAILRU_CLIENT_SECRET) {
    return null;
  }
  return {
    providerId: "mailru",
    clientId: env.MAILRU_CLIENT_ID,
    clientSecret: env.MAILRU_CLIENT_SECRET,
    authorizationUrl: "https://o2.mail.ru/login",
    tokenUrl: "https://o2.mail.ru/token",
    authentication: "basic" as const,
    getToken: async ({ code, redirectURI }: GenericOAuthGetTokenParams) => {
      const response = await fetch("https://o2.mail.ru/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${env.MAILRU_CLIENT_ID}:${env.MAILRU_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectURI,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mail.ru token request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        x_mailru_vid?: string;
      };

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        accessTokenExpiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        xMailruVid: data.x_mailru_vid,
      };
    },
    getUserInfo: async (tokens: GenericOAuthTokens) => {
      if (!tokens.accessToken) {
        throw new Error("Mail.ru access token is missing");
      }

      const mailruTokens = tokens as GenericOAuthTokens & { xMailruVid?: string };

      const response = await fetch(
        `https://o2.mail.ru/userinfo?access_token=${encodeURIComponent(tokens.accessToken)}`,
      );

      if (!response.ok) {
        throw new Error(`Mail.ru user info request failed with status ${response.status}`);
      }

      const profile = (await response.json()) as {
        email?: string;
        name?: string;
        first_name?: string;
        last_name?: string;
        locale?: string;
      };

      return {
        id: String(mailruTokens.xMailruVid ?? profile.email),
        email: profile.email,
        emailVerified: Boolean(profile.email),
        name:
          profile.name ??
          ([profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || profile.email),
      };
    },
  };
}
