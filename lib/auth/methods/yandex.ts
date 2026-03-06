import type { GenericOAuthConfig } from "better-auth/plugins";
import { env } from "@/lib/env";

type GenericOAuthTokens = Parameters<NonNullable<GenericOAuthConfig["getUserInfo"]>>[0];

export function getYandexProvider(isEnabled: boolean): GenericOAuthConfig | null {
  if (!isEnabled || !env.YANDEX_CLIENT_ID || !env.YANDEX_CLIENT_SECRET) {
    return null;
  }
  return {
    providerId: "yandex",
    clientId: env.YANDEX_CLIENT_ID,
    clientSecret: env.YANDEX_CLIENT_SECRET,
    authorizationUrl: "https://oauth.yandex.ru/authorize",
    tokenUrl: "https://oauth.yandex.ru/token",
    getUserInfo: async (tokens: GenericOAuthTokens) => {
      if (!tokens.accessToken) {
        throw new Error("Yandex access token is missing");
      }

      const response = await fetch("https://login.yandex.ru/info?format=json", {
        headers: {
          Authorization: `OAuth ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Yandex user info request failed with status ${response.status}`);
      }

      const profile = (await response.json()) as {
        id: string;
        login?: string;
        default_email?: string;
        display_name?: string;
        real_name?: string;
        default_avatar_id?: string;
      };

      return {
        id: profile.id,
        email: profile.default_email,
        emailVerified: Boolean(profile.default_email),
        name:
          profile.real_name ??
          profile.display_name ??
          profile.login ??
          profile.default_email ??
          profile.id,
        image: profile.default_avatar_id
          ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
          : undefined,
      };
    },
  };
}
