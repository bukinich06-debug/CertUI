import { statusConfig } from "@/components/pages/certs/constants";
import { CardDto } from "../../types";

const STATUS_ORDER = ["active", "expired", "used"] as const;

const STATUS_LABEL: Record<(typeof STATUS_ORDER)[number], string> = {
  active: "Активных",
  expired: "Просроченных",
  used: "Использованных",
};

type BadgeInfo = {
  status: (typeof STATUS_ORDER)[number];
  count: number;
  label: string;
  className: string;
  dotClass: string;
};

const buildBadges = (stats?: CardDto["stats"]): BadgeInfo[] => {
  const safeStats = stats ?? { active: 0, expired: 0, used: 0 };

  return STATUS_ORDER.flatMap((status) => {
    const count = safeStats[status] ?? 0;
    if (count <= 0) return [];

    const { className, dotClass } = statusConfig[status];
    return [{ status, count, label: STATUS_LABEL[status], className, dotClass }];
  });
};

interface Props {
  stats?: CardDto["stats"];
}

export const CardStats = ({ stats }: Props) => {
  const badges = buildBadges(stats);

  if (!badges.length) {
    return <p className="text-sm text-muted-foreground">Сертификатов пока нет</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {badges.map(({ status, count, label, className, dotClass }) => (
        <span
          key={status}
          className={`inline-flex w-full items-center justify-between gap-3 rounded-full px-3 py-2 text-xs font-semibold ${className}`}
        >
          <span className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
            <span className="text-xs uppercase tracking-wide text-foreground/70 dark:text-foreground/80">
              {label}
            </span>
          </span>
          <span className="text-sm font-semibold">{count}</span>
        </span>
      ))}
    </div>
  );
};
