import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const KNOWN_STATUSES = ["active", "used", "expired"] as const;

type KnownStatus = (typeof KNOWN_STATUSES)[number];

type CardStats = Record<KnownStatus, number>;
type GroupedCertRow = {
  card_id: bigint;
  status: string;
  _count: { _all: number };
};

const emptyStats = (): CardStats => ({
  active: 0,
  used: 0,
  expired: 0,
});

const buildStatsMap = async (cardIds: bigint[]) => {
  if (!cardIds.length) return new Map<string, CardStats>();

  const grouped = await prisma.certs.groupBy({
    by: ["card_id", "status"],
    where: {
      card_id: { in: cardIds },
      status: { in: KNOWN_STATUSES as unknown as string[] },
    },
    _count: { _all: true },
  });

  const result = new Map<string, CardStats>();

  grouped.forEach((row: GroupedCertRow) => {
    const key = row.card_id.toString();
    const stats = result.get(key) ?? emptyStats();

    if (KNOWN_STATUSES.includes(row.status as KnownStatus)) {
      stats[row.status as KnownStatus] = row._count._all;
    }

    result.set(key, stats);
  });

  return result;
};

const normalizeCard = (
  card: Awaited<ReturnType<typeof prisma.cards.findFirstOrThrow>>,
  stats: CardStats,
) => ({
  id: Number(card.id),
  name: card.name,
  stats,
});

export const GET = async () => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = BigInt(user.id);
    let cards = await prisma.cards.findMany({
      where: { user_id: userId },
    });

    if (cards.length === 0) {
      const created = await prisma.cards.create({
        data: {
          user_id: userId,
          name: "Мой Бизнес",
        },
      });
      cards = [created];
    }

    const statsMap = await buildStatsMap(cards.map((c) => c.id));

    return NextResponse.json(cards.map((card) => normalizeCard(card, statsMap.get(card.id.toString()) ?? emptyStats())));
  } catch (error) {
    console.error("Failed to fetch cards", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const idRaw = body.id ?? body.cardId;
    if (idRaw === undefined || idRaw === null) {
      return NextResponse.json({ error: "Card id is required" }, { status: 400 });
    }

    let id: bigint;
    try {
      id = BigInt(idRaw);
    } catch {
      return NextResponse.json({ error: "Card id must be a number" }, { status: 400 });
    }

    const userId = BigInt(user.id);
    const existing = await prisma.cards.findUnique({ where: { id } });
    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updated = await prisma.cards.update({
      where: { id },
      data: {
        name: body.name.trim(),
        updated_at: new Date(),
      },
    });

    const stats = (await buildStatsMap([id])).get(id.toString()) ?? emptyStats();

    return NextResponse.json(normalizeCard(updated, stats));
  } catch (error) {
    console.error("Failed to update card", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

