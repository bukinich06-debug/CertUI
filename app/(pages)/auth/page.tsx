import { AuthPage } from "@/components/pages";
import { isEmailAuthEnabled } from "@/lib/auth-flags";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const Auth = async () => {
  const sessionUser = await getSessionUser();

  if (sessionUser) redirect("/main");

  return <AuthPage emailAuthEnabled={isEmailAuthEnabled} />;
};

export default Auth;
