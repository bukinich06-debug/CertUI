import { prisma } from "@/lib/prisma";
import { sendAuthEmail } from "@/lib/email/resend";
import { isEmailAuthEnabled } from "@/lib/auth-flags";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

const isProduction = process.env.NODE_ENV === "production";

const fallbackBaseUrl = "http://localhost:3000";
const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  fallbackBaseUrl;

const secret =
  process.env.BETTER_AUTH_SECRET ??
  "replace-this-secret-in-production-before-deploying";

const trustedOrigins = Array.from(
  new Set(
    [baseURL, fallbackBaseUrl, process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(
      (value): value is string => Boolean(value),
    ),
  ),
);

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET
    ? {
        vk: {
          clientId: process.env.VK_CLIENT_ID,
          clientSecret: process.env.VK_CLIENT_SECRET,
        },
      }
    : {}),
};

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
  emailAndPassword: {
    enabled: isEmailAuthEnabled,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendAuthEmail({
        type: "password-reset",
        to: user.email,
        url,
        userName: user.name,
        idempotencyKey: `password-reset/${user.id}/${token}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendAuthEmail({
        type: "verification",
        to: user.email,
        url,
        userName: user.name,
        idempotencyKey: `email-verification/${user.id}/${token}`,
      });
    },
  },
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
      trustedProviders: ["google", "vk", "credential"],
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
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
