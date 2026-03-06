"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useState } from "react";

const buildAbsoluteUrl = (path: string) => `${window.location.origin}${path}`;

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: buildAbsoluteUrl("/auth/reset-password"),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось отправить письмо для сброса пароля.");
        return;
      }

      setMessage(
        "Если этот email можно использовать для входа по почте, мы отправили письмо с дальнейшими шагами.",
      );
      form.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось отправить письмо для сброса пароля.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Задать или сбросить пароль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Эта страница подходит и для обычного сброса пароля, и для добавления пароля к аккаунту,
              если вы раньше входили только через Google или VK.
            </AlertDescription>
          </Alert>

          {message ? (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Отправляем..." : "Отправить ссылку"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/auth" className="text-primary underline-offset-4 hover:underline">
              Вернуться ко входу
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
