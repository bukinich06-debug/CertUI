import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const Home = async () => {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect("/main");
  }

  redirect("/auth");
};

export default Home;
