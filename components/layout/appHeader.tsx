"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  hasSession?: boolean;
  userName?: string;
  loginHref?: string;
}

export const AppHeader = ({
  hasSession = false,
  userName,
  loginHref = "/auth",
}: IProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isAuthPage = pathname === "/auth";
  const isAuthenticated = isAuthPage ? false : hasSession;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.push("/auth");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/main" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/15 group-hover:text-primary/90 group-hover:ring-primary/30">
            <span className="text-base font-semibold">CU</span>
          </div>
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-wide text-primary/70 group-hover:text-primary/80">
              Cert UI
            </div>
            <div className="text-base font-semibold text-foreground group-hover:text-foreground">
              Подарочные сертификаты
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border">
            <span
              className={`h-2 w-2 rounded-full ${
                isAuthenticated ? "bg-emerald-500" : "bg-amber-400"
              }`}
              aria-hidden
            />
            <span>{isAuthenticated ? userName ?? "Пользователь" : "Гость"}</span>
          </div>

          {isAuthenticated ? (
            <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? "Выход..." : "Выйти"}
            </Button>
          ) : (
            <Button variant="default" asChild>
              <Link href={loginHref} prefetch={false}>
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
