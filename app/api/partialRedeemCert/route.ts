"use server";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const code = body?.code;
    const amountRaw = body?.amount;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code обязателен" }, { status: 400 });
    }

    const numericAmount =
      typeof amountRaw === "number" && Number.isFinite(amountRaw)
        ? amountRaw
        : Number.parseFloat(String(amountRaw));

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Некорректная сумма частичного погашения" }, { status: 400 });
    }

    const roundedAmount = Math.round(numericAmount * 100) / 100;
    if (roundedAmount <= 0) {
      return NextResponse.json({ error: "Сумма частичного погашения должна быть больше нуля" }, { status: 400 });
    }

    const existing = await prisma.certs.findUnique({ where: { code } });
    if (!existing) {
      return NextResponse.json({ error: "Сертификат не найден" }, { status: 404 });
    }

    const card = await prisma.cards.findUnique({ where: { id: existing.card_id } });
    const currentUserId = BigInt(user.id);

    if (!card || card.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "Нет прав погашать этот сертификат: он создан другим пользователем" },
        { status: 403 },
      );
    }

    if (existing.status === "used") {
      return NextResponse.json({ error: "Сертификат уже погашен" }, { status: 400 });
    }

    const currentBalance = new Prisma.Decimal(existing.balance);
    const decimalAmount = new Prisma.Decimal(roundedAmount.toFixed(2));

    if (decimalAmount.greaterThan(currentBalance)) {
      return NextResponse.json(
        { error: "Сумма частичного погашения не может превышать остаток по сертификату" },
        { status: 400 },
      );
    }

    if (decimalAmount.isZero()) {
      return NextResponse.json(
        { error: "Сумма частичного погашения должна быть больше нуля" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const newBalance = currentBalance.minus(decimalAmount);

      const updatedCert = await tx.certs.update({
        where: { code },
        data: {
          balance: newBalance,
          status: newBalance.greaterThan(0) ? existing.status : "used",
        },
      });

      await tx.cert_events.create({
        data: {
          cert_id: existing.id,
          event_type: "PARTIAL_REDEEM",
          amount_delta: decimalAmount.negated(),
          balance_after: newBalance,
        },
      });

      return updatedCert;
    });

    return NextResponse.json(normalizeCert(updated));
  } catch (error) {
    console.error("Failed to partially redeem certificate", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

