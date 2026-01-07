"use server";

import "server-only";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, sessionCookieOptions } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

/*
* Хэширует токен
* @param token - Токен для хэширования
* @returns Хэшированный токен
*/
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/*
* Генерирует токен сессии
* @returns Токен сессии
*/
const generateSessionToken = () => randomBytes(32).toString("base64url");

/*
* Получает IP-адрес клиента
* @param req - Запрос
* @returns IP-адрес клиента или null, если IP-адрес не найден
*/
export const getClientIp = async (req: Request): Promise<string | null> => {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0]?.trim() || null;
};

/*
* Создает сессию
* @param params - Параметры для создания сессии
* @returns Токен и срок действия сессии
*/
export const createSession = async (params: {
  userId: bigint;
  userAgent?: string | null;
  ip?: string | null;
}) => {
  const token = generateSessionToken();
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.sessions.create({
    data: {
      user_id: params.userId,
      refresh_token_hash: hash,
      user_agent: params.userAgent ?? null,
      ip: params.ip ?? null,
      expires_at: expiresAt,
    },
  });

  return { token, expiresAt };
};

/*
* Удаляет сессию по токену
* @param token - Токен сессии для удаления
*/
export const deleteSessionByToken = async (token: string) => {
  await prisma.sessions.deleteMany({
    where: { refresh_token_hash: hashToken(token) },
  });
};

/*
* Ищет сессию по токену
* @param token - Токен сессии для поиска
* @returns Сессия или null, если сессия не найдена
*/
const findSessionByToken = async (token: string) => {
  const hashed = hashToken(token);
  return prisma.sessions.findFirst({
    where: {
      refresh_token_hash: hashed,
      expires_at: { gt: new Date() },
    },
    include: { user: true },
  });
};

/*
* Получает куку из заголовка
* @param cookieHeader - Заголовок куки
* @param name - Имя куки
* @returns Значение куки или null, если кука не найдена
*/
const pickCookieFromHeader = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) || null : null;
};

/*
* Получает сессию из куков
* @param options - Опции для получения сессии
* @returns Сессия или null, если сессия не найдена
*/
export const getSessionFromCookies = async (options?: { cookieHeader?: string | null }) => {
  let token: string | null | undefined;

  if (options?.cookieHeader !== undefined) {
    token = pickCookieFromHeader(options.cookieHeader, SESSION_COOKIE_NAME);
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
    } catch {
      // cookies() недоступен вне server context
      token = null;
    }
  }
  if (!token) return null;

  const session = await findSessionByToken(token);
  if (!session) return null;

  return {
    token,
    session,
    user: session.user,
  };
};

/*
* Получает пользователя из сессии
* @returns Пользователь или null, если сессия не найдена
*/
export const getSessionUser = async () => {
  const data = await getSessionFromCookies();
  if (!data) return null;

  const { user } = data;

  return {
    id: user.id.toString(),
    email: user.email ?? null,
    name: user.name ?? null,
    avatarUrl: user.avatar_url ?? null,
  };
};

/*
* Очищает куку сессии
* @param cookieName - Имя куки
* @returns Опции куки
*/
export const clearSessionCookie = async (cookieName = SESSION_COOKIE_NAME) => {
  return {
    ...sessionCookieOptions,
    maxAge: 0,
    value: "",
    name: cookieName,
  };
};

