import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "../../google-icon";

interface Iprops {
  googleLoading: boolean;
  handleGoogleStart: () => void;
}

export const LoginForm = ({ googleLoading, handleGoogleStart }: Iprops) => {
  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: подключить ручку обычной авторизации
  };

  return (
    <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
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
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full">
          Войти
        </Button>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={googleLoading}
          variant="outline"
          onClick={handleGoogleStart}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Войти через Google
        </Button>
      </div>
    </form>
  );
};
