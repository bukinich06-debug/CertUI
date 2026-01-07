"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginForm } from "../login";
import { RegisterForm } from "../register";

export const AuthPage = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let mounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) return;
      })
      .catch(() => mounted);

    return () => {
      mounted = false;
    };
  }, []);

  const handleGoogleStart = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardContent className="space-y-6 pt-6">
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
              <LoginForm googleLoading={googleLoading} handleGoogleStart={handleGoogleStart} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm googleLoading={googleLoading} handleGoogleStart={handleGoogleStart} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
