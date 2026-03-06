"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { GoogleIcon } from "../../google-icon";
import { AuthMethod, isAuthMethodEnabled } from "@/lib/auth/methods";
import { VkIcon } from "@/components/icons/Vk";
import { YandexIcon } from "@/components/icons/Yandex";
import { MailRuIcon } from "@/components/icons/MailRu";

const getCallbackUrl = (path: string) => `${window.location.origin}${path}`;

const authMethodLabels: Partial<Record<AuthMethod, string>> = {
  google: "Google",
  vk: "VK",
  yandex: "Yandex",
  mailru: "Mail.ru",
};

export const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AuthMethod | null>(null);
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

  const handleSocialStart = async (provider: AuthMethod) => {
    try {
      setSelectedProvider(provider);
      setErrorMessage(null);

      let resultPromise;

      if (provider === "google" || provider === "vk") {
        resultPromise = authClient.signIn.social({
          provider,
          callbackURL: getCallbackUrl("/main"),
          errorCallbackURL: getCallbackUrl("/auth?error=oauth_failed"),
        });
      } else {
        resultPromise = authClient.signIn.oauth2({
          providerId: provider,
          callbackURL: getCallbackUrl("/main"),
          errorCallbackURL: getCallbackUrl("/auth?error=oauth_failed"),
        });
      }

      const result = await resultPromise;

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось начать OAuth-вход.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось начать OAuth-вход.");
    } finally {
      setSelectedProvider(null);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isAuthMethodEnabled("email") && (
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
      )}

      <div className="flex flex-col gap-3">
        {isAuthMethodEnabled("email") && (
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || selectedProvider !== null}
          >
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
        )}

        {isAuthMethodEnabled("google") && (
          <Button
            type="button"
            className="w-full gap-2"
            disabled={isSubmitting || selectedProvider !== null}
            variant="outline"
            onClick={() => handleSocialStart("google")}
          >
            {selectedProvider === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Войти через Google
          </Button>
        )}
        {isAuthMethodEnabled("vk") && (
          <Button
            type="button"
            className="w-full gap-2"
            disabled={isSubmitting || selectedProvider !== null}
            variant="outline"
            onClick={() => handleSocialStart("vk")}
          >
            {selectedProvider === "vk" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <VkIcon />
            )}
            Войти через VK
          </Button>
        )}

        {isAuthMethodEnabled("yandex") && (
          <Button
            type="button"
            className="w-full gap-2"
            disabled={isSubmitting || selectedProvider !== null}
            variant="outline"
            onClick={() => handleSocialStart("yandex")}
          >
            {selectedProvider === "yandex" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <YandexIcon />  
            )}
            Войти через {authMethodLabels.yandex}
          </Button>
        )}

        {isAuthMethodEnabled("mailru") && (
          <Button
            type="button"
            className="w-full gap-2"
            disabled={isSubmitting || selectedProvider !== null}
            variant="outline"
            onClick={() => handleSocialStart("mailru")}
          >
            {selectedProvider === "mailru" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MailRuIcon />
            )}
            Войти через {authMethodLabels.mailru}
          </Button>
        )}

        {!isAuthMethodEnabled("email") && (
          <Button type="button" className="w-full" variant="secondary" disabled>
            Email + Пароль (скоро...)
          </Button>
        )}

        {isAuthMethodEnabled("email") && (
          <Link
            href="/auth/forgot-password"
            className="text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Задать или восстановить пароль
          </Link>
        )}
      </div>
    </form>
  );
};
