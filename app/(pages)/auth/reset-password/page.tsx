"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Отсутствует token для сброса пароля.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Не удалось обновить пароль.");
        return;
      }

      setMessage(
        "Пароль обновлен. Теперь можно входить по email и паролю, а также продолжать использовать Google или VK.",
      );
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось обновить пароль.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Новый пароль для входа по почте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenError ? (
            <Alert variant="destructive">
              <AlertDescription>Ссылка недействительна или уже истекла.</AlertDescription>
            </Alert>
          ) : null}
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
            <Input
              name="password"
              type="password"
              placeholder="Новый пароль"
              autoComplete="new-password"
              required
            />
            <Input
              name="confirm-password"
              type="password"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="w-full" disabled={!token || isSubmitting || Boolean(tokenError)}>
              {isSubmitting ? "Сохраняем..." : "Сохранить пароль"}
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

export default ResetPasswordPage;
