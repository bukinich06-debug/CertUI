import { sendAuthEmail } from "@/lib/email/resend";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import {
  assertEnabledProviderConfig,
  getEmailConfig,
  getGenericOAuthProviders,
  getSocialProviders,
  isAuthMethodEnabled,
} from "./methods";

const isProduction = env.NODE_ENV === "production";
const fallbackBaseUrl = "http://localhost:3000";
const baseURL = env.NEXT_PUBLIC_APP_URL ?? fallbackBaseUrl;
const secret = env.BETTER_AUTH_SECRET ?? "replace-this-secret-in-production-before-deploying";
const trustedOrigins = Array.from(
  new Set(
    [baseURL, fallbackBaseUrl, env.NEXT_PUBLIC_APP_URL].filter(
      (value): value is string => Boolean(value),
    ),
  ),
);

assertEnabledProviderConfig("google", [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET]);
assertEnabledProviderConfig("vk", [env.VK_CLIENT_ID, env.VK_CLIENT_SECRET]);
assertEnabledProviderConfig("yandex", [env.YANDEX_CLIENT_ID, env.YANDEX_CLIENT_SECRET]);
assertEnabledProviderConfig("mailru", [env.MAILRU_CLIENT_ID, env.MAILRU_CLIENT_SECRET]);

const socialProviders = getSocialProviders();
const genericOAuthProviders = getGenericOAuthProviders();
const authPlugins = [
  nextCookies(),
  ...(genericOAuthProviders.length > 0 ? [genericOAuth({ config: genericOAuthProviders })] : []),
];

const emailConfig = getEmailConfig({
  sendAuthEmail,
  isEmailEnabled: isAuthMethodEnabled("email"),
});

export const auth = betterAuth({
  appName: "Cert UI",
  baseURL,
  secret,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    useSecureCookies: isProduction,
    database: {
      generateId: "serial",
    },
  },
  ...emailConfig,
  socialProviders,
  user: {
    modelName: "users",
    fields: {
      image: "avatar_url",
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    modelName: "oauth_accounts",
    fields: {
      userId: "user_id",
      accountId: "provider_user_id",
      providerId: "provider",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "expires_at",
      refreshTokenExpiresAt: "refresh_expires_at",
      scope: "scope",
      password: "password",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    accountLinking: {
      enabled: true,
      trustedProviders: [
        ...env.NEXT_PUBLIC_ENABLED_AUTH_METHODS,
        ...(isAuthMethodEnabled("email") ? ["credential"] : []),
      ],
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      token: "token",
      expiresAt: "expires_at",
      ipAddress: "ip",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    expiresIn: 60 * 60 * 24 * 7,
  },
  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins: authPlugins,
});

export type AuthSession = typeof auth.$Infer.Session;
