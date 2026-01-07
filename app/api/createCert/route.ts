import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

const normalizeCert = (cert: Awaited<ReturnType<typeof prisma.certs.create>>) => ({
  code: cert.code,
  recipient: cert.recipient,
  amount: Number(cert.amount),
  balance: Number(cert.balance),
  issuedAt: cert.issued_at.toISOString().slice(0, 10),
  expiresAt: cert.expires_at ? cert.expires_at.toISOString().slice(0, 10) : null,
  status: cert.status as "active" | "used" | "expired",
});

export const POST = async (req: Request) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "требуется тело запроса" }, { status: 400 });
    }

    if (body.cardId === undefined || body.cardId === null) {
      return NextResponse.json({ error: "cardId обязателен" }, { status: 400 });
    }

    let cardId: bigint;
    try {
      cardId = BigInt(body.cardId);
    } catch {
      return NextResponse.json({ error: "cardId должно быть числом" }, { status: 400 });
    }

    const currentUserId = BigInt(user.id);
    const card = await prisma.cards.findUnique({ where: { id: cardId } });
    if (!card || card.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "Нет прав на создание сертификатов для этой карточки" },
        { status: 403 },
      );
    }

    if (typeof body.recipient !== "string" || !body.recipient.trim()) {
      return NextResponse.json({ error: "требуется recipient" }, { status: 400 });
    }

    const amountNumber = Number(body.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "amount должно быть положительным числом" }, { status: 400 });
    }

    const issuedAt = new Date();
    issuedAt.setUTCHours(0, 0, 0, 0); // TODO: заменить на реальную дату выдачи, когда она появится в запросе

    let expiresAt: Date | null = null;
    if (body.expiresAt !== undefined && body.expiresAt !== null && String(body.expiresAt).trim() !== "") {
      const parsedExpiresAt = new Date(body.expiresAt);
      if (Number.isNaN(parsedExpiresAt.getTime())) {
        return NextResponse.json({ error: "expiresAt недопустимо" }, { status: 400 });
      }
      expiresAt = parsedExpiresAt;
    }

    const cert = await prisma.certs.create({
      data: {
        card_id: cardId,
        recipient: body.recipient.trim(),
        amount: new Prisma.Decimal(amountNumber),
        balance: new Prisma.Decimal(amountNumber),
        issued_at: issuedAt,
        expires_at: expiresAt ?? null,
        status: "active",
      }
    });

    const origin = new URL(req.url).origin;
    const certUrl = `${origin}/?code=${encodeURIComponent(cert.code)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(certUrl, {
      type: "image/png",
      margin: 1,
      scale: 6,
    });

    return NextResponse.json(
      { ...normalizeCert(cert), qrCodeDataUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("Не удалось создать сертификат.", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
};
