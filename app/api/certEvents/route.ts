import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type CertEventResponse = {
  id: number;
  eventType: string;
  amountDelta: number | null;
  balanceAfter: number | null;
  note: string | null;
  createdAt: string;
};

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

    const events = await prisma.cert_events.findMany({
      where: { cert_id: cert.id },
      orderBy: { created_at: "asc" },
    });

    const response: CertEventResponse[] = events.map((event) => ({
      id: Number(event.id),
      eventType: event.event_type,
      amountDelta: event.amount_delta != null ? Number(event.amount_delta) : null,
      balanceAfter: event.balance_after != null ? Number(event.balance_after) : null,
      note: event.note ?? null,
      createdAt: event.created_at.toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch certificate events", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

