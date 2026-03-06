import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { AuthMethod } from "./auth/methods/constants";

const booleanSchema = z.string().transform((value) => value === "true");

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const betterAuthSchema = z.object({
  // NOTE: openssl rand -base64 32
  BETTER_AUTH_SECRET: z.string().min(1),
});

const googleSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
});

const vkSchema = z.object({
  VK_CLIENT_ID: z.string().min(1).optional(),
  VK_CLIENT_SECRET: z.string().min(1).optional(),
});

const yandexSchema = z.object({
  YANDEX_CLIENT_ID: z.string().min(1).optional(),
  YANDEX_CLIENT_SECRET: z.string().min(1).optional(),
});

const mailruSchema = z.object({
  MAILRU_CLIENT_ID: z.string().min(1).optional(),
  MAILRU_CLIENT_SECRET: z.string().min(1).optional(),
});

const emailAuthSchema = z.object({
  // NOTE: Опционально пока что потому что нету домена для отправки email
  RESEND_API_KEY: z.string().min(1).optional(),
  AUTH_FROM_EMAIL: z.string().min(1).optional(),
  AUTH_REPLY_TO_EMAIL: z.string().min(1).optional(),

  // NOTE: console - для локальной разработки (присылвает код в терминал), resend - для production
  AUTH_EMAIL_TRANSPORT: z.enum(["console", "resend"]).optional(),

  AUTH_EMAIL_DEV_TO_TERMINAL: booleanSchema.optional(),
});

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CRON_SECRET: z.string().min(1).optional(),
    ...databaseSchema.shape,
    ...betterAuthSchema.shape,
    ...emailAuthSchema.shape,
    ...googleSchema.shape,
    ...vkSchema.shape,
    ...yandexSchema.shape,
    ...mailruSchema.shape,
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).optional(),
    NEXT_PUBLIC_ENABLED_AUTH_METHODS: z.string().transform(value => JSON.parse(value) as AuthMethod[]),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    VK_CLIENT_ID: process.env.VK_CLIENT_ID,
    VK_CLIENT_SECRET: process.env.VK_CLIENT_SECRET,
    YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
    YANDEX_CLIENT_SECRET: process.env.YANDEX_CLIENT_SECRET,
    MAILRU_CLIENT_ID: process.env.MAILRU_CLIENT_ID,
    MAILRU_CLIENT_SECRET: process.env.MAILRU_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUTH_FROM_EMAIL: process.env.AUTH_FROM_EMAIL,
    AUTH_REPLY_TO_EMAIL: process.env.AUTH_REPLY_TO_EMAIL,
    AUTH_EMAIL_TRANSPORT: process.env.AUTH_EMAIL_TRANSPORT,
    AUTH_EMAIL_DEV_TO_TERMINAL: process.env.AUTH_EMAIL_DEV_TO_TERMINAL,
    NEXT_PUBLIC_ENABLED_AUTH_METHODS: process.env.NEXT_PUBLIC_ENABLED_AUTH_METHODS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
});

export type Env = typeof env;
