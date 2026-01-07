import { AuthPage } from "@/components/pages";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const Auth = async () => {
  const sessionUser = await getSessionUser();

  if (sessionUser) redirect("/main");

  return <AuthPage />;
};

export default Auth;
