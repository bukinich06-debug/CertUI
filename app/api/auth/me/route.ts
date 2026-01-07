import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const GET = async () => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
};

