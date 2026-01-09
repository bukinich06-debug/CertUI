import { CodeAccessDialog } from "@/components/pages/home";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type IProps = {
  searchParams?: { code?: string };
};

const Home = async ({ searchParams }: IProps) => {
  const codeRaw = searchParams?.code;
  const code = typeof codeRaw === "string" ? codeRaw.trim() : "";

  const sessionUser = await getSessionUser();

  if (!code) {
    if (sessionUser) redirect("/main");
    redirect("/auth");
  }

  if (!sessionUser) return <CodeAccessDialog variant="auth" fallbackHref="/auth" />;

  const cert = await prisma.certs.findUnique({ where: { code } });
  if (!cert) return <CodeAccessDialog variant="notFound" fallbackHref="/main" />;

  const card = await prisma.cards.findUnique({ where: { id: cert.card_id } });
  const currentUserId = BigInt(sessionUser.id);

  if (!card || card.user_id !== currentUserId)
    return <CodeAccessDialog variant="forbidden" fallbackHref="/main" />;

  const cardId = Number(cert.card_id);
  redirect(`/certs?cardId=${cardId}&code=${encodeURIComponent(code)}`);
};

export default Home;
