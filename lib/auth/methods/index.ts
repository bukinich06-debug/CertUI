import { env } from "@/lib/env";
import { authMethods, type AuthMethod } from "./constants";
import { getGoogleProvider } from "./google";
import { getMailruProvider } from "./mailru";
import { getVkProvider } from "./vk";
import { getYandexProvider } from "./yandex";

export { authMethods, type AuthMethod } from "./constants";

export const isAuthMethodEnabled = (method: AuthMethod) =>
  env.NEXT_PUBLIC_ENABLED_AUTH_METHODS.includes(method);

const requiredProviderEnv = {
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  vk: ["VK_CLIENT_ID", "VK_CLIENT_SECRET"],
  yandex: ["YANDEX_CLIENT_ID", "YANDEX_CLIENT_SECRET"],
  mailru: ["MAILRU_CLIENT_ID", "MAILRU_CLIENT_SECRET"],
} as const;

export function assertEnabledProviderConfig(
  provider: keyof typeof requiredProviderEnv,
  values: Array<string | undefined>,
) {
  if (!env.NEXT_PUBLIC_ENABLED_AUTH_METHODS.includes(provider)) return;
  if (values.every(Boolean)) return;
  throw new Error(
    `Enabled auth method "${provider}" requires env vars: ${requiredProviderEnv[provider].join(", ")}`,
  );
}

export function getSocialProviders() {
  return {
    ...getGoogleProvider(isAuthMethodEnabled("google")),
    ...getVkProvider(isAuthMethodEnabled("vk")),
  };
}

export function getGenericOAuthProviders() {
  const yandex = getYandexProvider(isAuthMethodEnabled("yandex"));
  const mailru = getMailruProvider(isAuthMethodEnabled("mailru"));
  const providers = [yandex, mailru].filter(Boolean);
  return providers as NonNullable<typeof yandex>[];
}

export { getEmailConfig } from "./email";
