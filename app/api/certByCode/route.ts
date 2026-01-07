import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const normalizeCert = (cert: Awaited<ReturnType<typeof prisma.certs.findUniqueOrThrow>>) => ({
  code: cert.code,
  recipient: cert.recipient,
  amount: Number(cert.amount),
  balance: Number(cert.balance),
  issuedAt: cert.issued_at.toISOString().slice(0, 10),
  expiresAt: cert.expires_at ? cert.expires_at.toISOString().slice(0, 10) : null,
  status: cert.status as "active" | "used" | "expired",
});

export const GET = async (request: Request) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "code query param is required" }, { status: 400 });
    }

    const cert = await prisma.certs.findUnique({ where: { code } });

    if (!cert) {
      return NextResponse.json({ error: "Сертификат не существует" }, { status: 404 });
    }

    const card = await prisma.cards.findUnique({ where: { id: cert.card_id } });
    const currentUserId = BigInt(user.id);

    if (!card || card.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "Нет прав на этот сертификат: он создан другим пользователем" },
        { status: 403 },
      );
    }

    return NextResponse.json(normalizeCert(cert));
  } catch (error) {
    console.error("Failed to fetch cert by code", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};


