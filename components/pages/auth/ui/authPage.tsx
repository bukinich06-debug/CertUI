"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LoginForm } from "../login";
import { RegisterForm } from "../register";
import { isAuthMethodEnabled } from "@/lib/auth/methods";


export const AuthPage = () => {
  const searchParams = useSearchParams();


  const statusMessage = useMemo(() => {
    if (searchParams.get("verified") === "1") {
      return "Email подтвержден. Теперь можно войти в аккаунт.";
    }

    const error = searchParams.get("error");
    if (!error) return null;

    if (error === "INVALID_TOKEN") {
      return "Ссылка недействительна или уже истекла.";
    }

    if (error === "oauth_failed") {
      return "Не удалось завершить вход через внешний провайдер.";
    }

    return `Ошибка авторизации: ${error}`;
  }, [searchParams]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardContent className="space-y-6 pt-6">
          {statusMessage ? (
            <Alert>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          ) : null}

          {!isAuthMethodEnabled("email") && (
            <LoginForm />
          )}

          {isAuthMethodEnabled("email") && (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Вход
                </TabsTrigger>
                
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
