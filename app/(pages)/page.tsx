import { CodeAccessDialog } from "@/components/pages/home";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type IProps = {
  searchParams?: { code?: string } | Promise<{ code?: string }>;
};

const resolveSearchParams = async (searchParams?: IProps["searchParams"]) => {
  if (searchParams && typeof (searchParams as Promise<unknown>).then === "function") {
    return (await searchParams) ?? {};
  }
  return searchParams ?? {};
};

const Home = async ({ searchParams }: IProps) => {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const codeRaw = resolvedSearchParams.code;
  const code = typeof codeRaw === "string" ? codeRaw.trim() : "";

  const session = await auth.api.getSession({ headers: await headers() });

  if (!code) {
    if (session) redirect("/main");
    redirect("/auth");
  }

  if (!session) return <CodeAccessDialog variant="auth" fallbackHref="/auth" />;

  const cert = await prisma.certs.findUnique({ where: { code } });
  if (!cert) return <CodeAccessDialog variant="notFound" fallbackHref="/main" />;

  const card = await prisma.cards.findUnique({ where: { id: cert.card_id } });
  const currentUserId = BigInt(session.user.id);

  if (!card || card.user_id !== currentUserId)
    return <CodeAccessDialog variant="forbidden" fallbackHref="/main" />;

  const cardId = Number(cert.card_id);
  redirect(`/certs?cardId=${cardId}&code=${encodeURIComponent(code)}`);
};

export default Home;
