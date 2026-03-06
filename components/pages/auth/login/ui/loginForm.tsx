"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GoogleIcon } from "../../google-icon";

const getCallbackUrl = (path: string) => `${window.location.origin}${path}`;

type LoginFormProps = {
  emailAuthEnabled?: boolean;
};

export const LoginForm = ({ emailAuthEnabled = true }: LoginFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<"google" | "vk" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("login-email") ?? "").trim();
    const password = String(formData.get("login-password") ?? "");

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: getCallbackUrl("/main"),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось выполнить вход.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось выполнить вход.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialStart = async (provider: "google" | "vk") => {
    try {
      setSocialProvider(provider);
      setErrorMessage(null);

      const result = await authClient.signIn.social({
        provider,
        callbackURL: getCallbackUrl("/main"),
        errorCallbackURL: getCallbackUrl("/auth?error=oauth_failed"),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось начать OAuth-вход.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось начать OAuth-вход.");
    } finally {
      setSocialProvider(null);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {emailAuthEnabled ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="login-email">Почта</Label>
            <Input
              id="login-email"
              name="login-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Пароль</Label>
            <Input
              id="login-password"
              name="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
        </>
      ) : null}
      <div className="flex flex-col gap-3">

        {emailAuthEnabled ? (
          <Button type="submit" className="w-full" disabled={isSubmitting || socialProvider !== null}>
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
        ) : null}
        <Button
          type="button"
          className="w-full gap-2"
          disabled={isSubmitting || socialProvider !== null}
          variant="outline"
          onClick={() => handleSocialStart("google")}
        >
          {socialProvider === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Войти через Google
        </Button>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={isSubmitting || socialProvider !== null}
          variant="outline"
          onClick={() => handleSocialStart("vk")}
        >
          {socialProvider === "vk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>VK</span>}
          Войти через VK
        </Button>
        {!emailAuthEnabled ? (
          <Button type="button" className="w-full" variant="secondary" disabled>
            Email + Пароль (скоро...)
          </Button>
        ) : null}
        {emailAuthEnabled ? (
          <Link href="/auth/forgot-password" className="text-center text-sm text-primary underline-offset-4 hover:underline">
            Задать или восстановить пароль
          </Link>
        ) : null}
      </div>
    </form>
  );
};
