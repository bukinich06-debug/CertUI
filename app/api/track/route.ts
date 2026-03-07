import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const today = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json().catch(() => null);
    const path = body?.path;

    if (!path || typeof path !== "string") {
      return new NextResponse(null, { status: 400 });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;
    const referer = req.headers.get("referer") ?? null;
    const date = today();

    try {
      await prisma.events.upsert({
        where: {
          type_path_ip_date: {
            type: "page_view",
            path,
            ip: ip || "unknown",
            date,
          },
        },
        update: {
          hits: { increment: 1 },
          updated_at: new Date(),
        },
        create: {
          type: "page_view",
          path,
          ip: ip || "unknown",
          user_agent: userAgent,
          referer,
          date,
        },
      });
    } catch (error) {
      console.error("Failed to track event", error);
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
};
