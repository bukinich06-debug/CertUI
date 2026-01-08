import Link from "next/link";

import { Button } from "@/components/ui/button";

interface IProps {
  isAuthenticated?: boolean;
  userName?: string;
  loginHref?: string;
  logoutHref?: string;
}

export const AppHeader = ({
  isAuthenticated = false,
  userName,
  loginHref = "/auth",
  logoutHref = "/api/auth/logout",
}: IProps) => {
  const actionLabel = isAuthenticated ? "Выйти" : "Войти";
  const actionHref = isAuthenticated ? logoutHref : loginHref;

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

          <Button variant={isAuthenticated ? "outline" : "default"} asChild>
            <Link href={actionHref} prefetch={false}>
              {actionLabel}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
