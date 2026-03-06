import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const booleanSchema = z.string().transform((value) => value === "true");

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const betterAuthSchema = z.object({
  // NOTE: openssl rand -base64 32
  BETTER_AUTH_SECRET: z.string().min(1),
});

const googleSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const vkSchema = z.object({
  VK_CLIENT_ID: z.string().min(1),
  VK_CLIENT_SECRET: z.string().min(1),
});

const emailAuthSchema = z.object({
  // NOTE: Опционально пока что потому что нету домена для отправки email
  RESEND_API_KEY: z.string().min(1).optional(),
  AUTH_FROM_EMAIL: z.string().min(1),
  AUTH_REPLY_TO_EMAIL: z.string().min(1),

  // NOTE: console - для локальной разработки (присылвает код в терминал), resend - для production
  AUTH_EMAIL_TRANSPORT: z.enum(["console", "resend"]),

  AUTH_EMAIL_DEV_TO_TERMINAL: booleanSchema,
});



export const env = createEnv({
  // ANCHOR: Серверные переменные
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CRON_SECRET: z.string().min(1),
    ...databaseSchema.shape,
    ...betterAuthSchema.shape,
    ...googleSchema.shape,
    ...vkSchema.shape,
    ...emailAuthSchema.shape,
  },

  // ANCHOR: Клиентские переменные
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_EMAIL_AUTH_ENABLED: booleanSchema,

    // NOTE: Для различия текущего окружения, т.к. NODE_ENV всегда production после npm run build
    NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]),
  },

  // ANCHOR: Передаем переменные из process.env в env
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    VK_CLIENT_ID: process.env.VK_CLIENT_ID,
    VK_CLIENT_SECRET: process.env.VK_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUTH_FROM_EMAIL: process.env.AUTH_FROM_EMAIL,
    AUTH_REPLY_TO_EMAIL: process.env.AUTH_REPLY_TO_EMAIL,
    AUTH_EMAIL_TRANSPORT: process.env.AUTH_EMAIL_TRANSPORT,
    AUTH_EMAIL_DEV_TO_TERMINAL: process.env.AUTH_EMAIL_DEV_TO_TERMINAL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EMAIL_AUTH_ENABLED: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
});
