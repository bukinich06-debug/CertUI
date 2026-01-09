import { CodeAccessVariant } from "../types";

type DialogAction = {
    label: string;
    href: string;
    variant?: "default" | "outline";
};

export type DialogContent = {
    title: string;
    description: string;
    primaryAction: DialogAction;
    secondaryAction?: DialogAction;
};

export const getDialogContent = (
    variant: CodeAccessVariant,
    fallbackHref: string,
  ): DialogContent => {
    switch (variant) {
      case "auth":
        return {
          title: "Нужна авторизация",
          description: "Вы должны авторизоваться, чтобы воспользоваться просмотром сертификата.",
          primaryAction: { label: "Перейти к авторизации", href: "/auth" },
        };
      case "forbidden":
        return {
          title: "Нет прав на сертификат",
          description: "У текущего пользователя нет прав просматривать этот сертификат. Возможно, сертификат был создан другим пользователем.",
          primaryAction: { label: "Перейти в кабинет", href: fallbackHref },
        };
      case "notFound":
        return {
          title: "Сертификат не найден",
          description: "По переданному коду сертификат не найден.",
          primaryAction: { label: "Вернуться к карточкам", href: fallbackHref },
        };
      default:
        return {
          title: "Не удалось получить сертификат",
          description: "Произошла ошибка при загрузке сертификата. Попробуйте позже.",
          primaryAction: { label: "Перейти на главную", href: fallbackHref },
        };
    }
  };