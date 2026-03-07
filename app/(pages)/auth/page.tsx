import { AuthPage } from "@/components/pages";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Auth = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) redirect("/main");

  return <AuthPage />;
};

export default Auth;
