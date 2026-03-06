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

export const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<"google" | "vk" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("register-name") ?? "").trim();
    const email = String(formData.get("register-email") ?? "").trim();
    const password = String(formData.get("register-password") ?? "");
    const passwordConfirm = String(formData.get("register-password-confirm") ?? "");

    if (password !== passwordConfirm) {
      setErrorMessage("Пароли не совпадают.");
      setMessage(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setMessage(null);

      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: getCallbackUrl("/auth?verified=1"),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось зарегистрироваться.");
        return;
      }

      setMessage(
        "Если этот email можно использовать для входа по почте, проверьте почту и выполните дальнейшие шаги из письма.",
      );
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось зарегистрироваться.");
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
        newUserCallbackURL: getCallbackUrl("/main"),
        errorCallbackURL: getCallbackUrl("/auth?error=oauth_failed"),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось начать OAuth-регистрацию.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось начать OAuth-регистрацию.");
    } finally {
      setSocialProvider(null);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegisterSubmit} noValidate>
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>
            {message} Если вы уже входили через Google или VK, используйте{" "}
            <Link href="/auth/forgot-password" className="underline underline-offset-4">
              страницу задания пароля
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="register-name">Имя</Label>
        <Input
          id="register-name"
          name="register-name"
          placeholder="Иван"
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Почта</Label>
        <Input
          id="register-email"
          name="register-email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-password">Пароль</Label>
          <Input
            id="register-password"
            name="register-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password-confirm">Повторите пароль</Label>
          <Input
            id="register-password-confirm"
            name="register-password-confirm"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full" variant="default" disabled={isSubmitting || socialProvider !== null}>
          {isSubmitting ? "Создаем аккаунт..." : "Зарегистрироваться"}
        </Button>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={isSubmitting || socialProvider !== null}
          variant="outline"
          onClick={() => handleSocialStart("google")}
        >
          {socialProvider === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Зарегистрироваться через Google
        </Button>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={isSubmitting || socialProvider !== null}
          variant="outline"
          onClick={() => handleSocialStart("vk")}
        >
          {socialProvider === "vk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>VK</span>}
          Зарегистрироваться через VK
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Уже входили через Google или VK и хотите добавить вход по паролю? Используйте{" "}
          <Link href="/auth/forgot-password" className="text-primary underline-offset-4 hover:underline">
            страницу задания пароля
          </Link>
          .
        </p>
      </div>
    </form>
  );
};
