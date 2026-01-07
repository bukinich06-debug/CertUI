import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "../../google-icon";

interface Iprops {
  googleLoading: boolean;
  handleGoogleStart: () => void;
}

export const RegisterForm = ({ googleLoading, handleGoogleStart }: Iprops) => {
  const handleRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: подключить ручку регистрации
  };

  return (
    <form className="space-y-4" onSubmit={handleRegisterSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="register-login">Логин</Label>
        <Input
          id="register-login"
          name="register-login"
          placeholder="ivan"
          autoComplete="username"
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
        <Button type="submit" className="w-full" variant="default">
          Зарегистрироваться
        </Button>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={googleLoading}
          variant="outline"
          onClick={handleGoogleStart}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Зарегистрироваться через Google
        </Button>
      </div>
    </form>
  );
};
