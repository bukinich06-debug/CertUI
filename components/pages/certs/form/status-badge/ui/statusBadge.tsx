import { cn } from "@/lib/utils";
import { FC } from "react";
import { statusConfig } from "../../../constants";
import { GiftStatus } from "../../../types";

interface IProps {
  status: GiftStatus;
  className?: string;
}

export const StatusBadge: FC<IProps> = ({ status, className }: IProps) => {
  const config =
    statusConfig[status] ??
    {
      label: "Неизвестно",
      className: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
      dotClass: "bg-slate-400",
    };

  return (
    <label className={cn("space-y-1 md:col-span-2", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Статус
      </span>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${config.className}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
        {config.label}
      </span>
    </label>
  );
};
