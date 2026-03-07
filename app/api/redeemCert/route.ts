import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const normalizeCert = (cert: Awaited<ReturnType<typeof prisma.certs.update>>) => ({
  code: cert.code,
  recipient: cert.recipient,
  amount: Number(cert.amount),
  balance: Number(cert.balance),
  issuedAt: cert.issued_at.toISOString().slice(0, 10),
  expiresAt: cert.expires_at ? cert.expires_at.toISOString().slice(0, 10) : null,
  status: cert.status as "active" | "used" | "expired",
  note: cert.note ?? null,
});

export const POST = async (req: Request) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const code = body?.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code обязателен" }, { status: 400 });
    }

    const existing = await prisma.certs.findUnique({ where: { code } });
    if (!existing) {
      return NextResponse.json({ error: "Сертификат не найден" }, { status: 404 });
    }

    const card = await prisma.cards.findUnique({ where: { id: existing.card_id } });
    const currentUserId = BigInt(session.user.id);

    if (!card || card.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "Нет прав погашать этот сертификат: он создан другим пользователем" },
        { status: 403 },
      );
    }

    if (existing.status === "used") {
      return NextResponse.json({ error: "Сертификат уже погашен" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const amountDelta = existing.balance;

      const updatedCert = await tx.certs.update({
        where: { code },
        data: {
          status: "used",
          balance: new Prisma.Decimal(0),
        },
      });

      await tx.cert_events.create({
        data: {
          cert_id: existing.id,
          event_type: "REDEEMED",
          amount_delta: amountDelta ? amountDelta.negated() : null,
          balance_after: new Prisma.Decimal(0),
        },
      });

      return updatedCert;
    });

    return NextResponse.json(normalizeCert(updated));
  } catch (error) {
    console.error("Failed to redeem certificate", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

