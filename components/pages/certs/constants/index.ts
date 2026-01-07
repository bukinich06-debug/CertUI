import { GiftStatus } from "../types";

export const statusConfig: Record<GiftStatus, { label: string; className: string; dotClass: string }> = {
  active: {
    label: "Активен",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
    dotClass: "bg-emerald-500",
  },
  used: {
    label: "Использован",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
    dotClass: "bg-slate-400",
  },
  expired: {
    label: "Просрочен",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
    dotClass: "bg-amber-500",
  },
};
