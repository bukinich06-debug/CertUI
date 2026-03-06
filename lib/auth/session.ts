"use server";

import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSessionFromCookies = async (requestHeaders?: Headers) => {
  const resolvedHeaders = requestHeaders ?? (await headers());

  const session = await auth.api.getSession({
    headers: resolvedHeaders,
  });

  return session ?? null;
};

export const getSessionUser = async (requestHeaders?: Headers) => {
  const data = await getSessionFromCookies(requestHeaders);
  if (!data) return null;

  return {
    id: String(data.user.id),
    email: data.user.email ?? null,
    name: data.user.name ?? null,
    avatarUrl: data.user.image ?? null,
    emailVerified: Boolean(data.user.emailVerified),
  };
};

