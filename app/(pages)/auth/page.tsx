import { AuthPage } from "@/components/pages";
import { getSessionUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";

const Auth = async () => {
  const sessionUser = await getSessionUser();

  if (sessionUser) redirect("/main");

  return <AuthPage emailAuthEnabled={env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED} />;
};

export default Auth;
