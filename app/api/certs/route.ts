import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const normalizeCert = (cert: Awaited<ReturnType<typeof prisma.certs.findFirstOrThrow>>) => ({
  code: cert.code,
  recipient: cert.recipient,
  amount: Number(cert.amount),
  balance: Number(cert.balance),
  issuedAt: cert.issued_at.toISOString().slice(0, 10),
  expiresAt: cert.expires_at ? cert.expires_at.toISOString().slice(0, 10) : null,
  status: cert.status,
  note: cert.note ?? null,
});

export const GET = async (request: Request) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idRaw = searchParams.get("id");

    if (!idRaw) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    let cardId: bigint;
    try {
      cardId = BigInt(idRaw);
    } catch {
      return NextResponse.json({ error: "id must be a number" }, { status: 400 });
    }

    const card = await prisma.cards.findUnique({ where: { id: cardId } });
    const currentUserId = BigInt(user.id);

    if (!card || card.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "Нет прав на эту карточку — сертификаты принадлежат другому пользователю" },
        { status: 403 },
      );
    }

    const certs = await prisma.certs.findMany({
      where: { card_id: cardId },
    });

    return NextResponse.json(certs.map(normalizeCert));
  } catch (error) {
    console.error("Failed to fetch certs", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};