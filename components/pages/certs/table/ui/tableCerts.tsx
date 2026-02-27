import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { statusConfig } from "../../constants";
import { GiftCertificate, GiftStatus } from "../../types";
import { formatCertDate } from "../../utils/date";

type SortColumn = "recipient" | "status" | "amount" | "balance" | "expiresAt" | "issuedAt";

type SortDirection = "asc" | "desc";

type SortConfig = {
  column: SortColumn;
  direction: SortDirection;
};

interface IProps {
  certificatesMock: GiftCertificate[];
  setSelectedCert: Dispatch<SetStateAction<GiftCertificate | null>>;
  currency: Intl.NumberFormat;
  isLoading?: boolean;
  error?: string;
}

const statusOrder: Record<GiftStatus, number> = {
  active: 0,
  expired: 1,
  used: 2,
};

export const TableCerts = ({
  certificatesMock,
  setSelectedCert,
  currency,
  isLoading,
  error,
}: IProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: "issuedAt",
    direction: "desc",
  });

  const rows = useMemo(() => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground">
            Загрузка...
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-destructive">
            {error}
          </TableCell>
        </TableRow>
      );
    }

    if (certificatesMock.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground">
            Нет данных для отображения
          </TableCell>
        </TableRow>
      );
    }

    const sortedCertificates = [...certificatesMock].sort((a, b) => {
      const aIsUsed = a.status === "used";
      const bIsUsed = b.status === "used";

      if (aIsUsed !== bIsUsed) {
        return aIsUsed ? 1 : -1;
      }

      let compare = 0;

      switch (sortConfig.column) {
        case "recipient":
          compare = a.recipient.localeCompare(b.recipient);
          break;
        case "status":
          compare = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "amount":
          compare = a.amount - b.amount;
          break;
        case "balance":
          compare = a.balance - b.balance;
          break;
        case "expiresAt": {
          const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.POSITIVE_INFINITY;
          const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.POSITIVE_INFINITY;
          compare = aTime - bTime;
          break;
        }
        case "issuedAt":
        default: {
          const aTime = new Date(a.issuedAt).getTime();
          const bTime = new Date(b.issuedAt).getTime();
          compare = aTime - bTime;
          break;
        }
      }

      if (compare === 0) return 0;

      return sortConfig.direction === "asc" ? compare : -compare;
    });

    return sortedCertificates.map((cert) => {
      const now = new Date();
      const isOverdue = cert.expiresAt != null && now > new Date(cert.expiresAt);

      const baseStatus = statusConfig[cert.status] ?? {
        label: "Неизвестно",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
        dotClass: "bg-slate-400",
      };

      const status = isOverdue ? statusConfig.expired : baseStatus;

      return (
        <TableRow
          key={`${cert.recipient}-${cert.issuedAt}-${cert.expiresAt ?? "no-expiry"}-${cert.amount}`}
          onClick={() => setSelectedCert(cert)}
          className="cursor-pointer"
        >
          <TableCell>{cert.recipient}</TableCell>

          <TableCell className="w-[1%] whitespace-nowrap">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
          </TableCell>
          <TableCell className="text-right">{currency.format(cert.amount)}</TableCell>
          <TableCell className="text-right">{currency.format(cert.balance)}</TableCell>
          <TableCell>{formatCertDate(cert.expiresAt)}</TableCell>
          <TableCell>{formatCertDate(cert.issuedAt)}</TableCell>
        </TableRow>
      );
    });
  }, [certificatesMock, currency, error, isLoading, setSelectedCert, sortConfig]);

  const handleSort = (column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      const isDateColumn = column === "issuedAt" || column === "expiresAt";

      return {
        column,
        direction: isDateColumn ? "desc" : "asc",
      };
    });
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortConfig.column !== column) return null;

    return <span className="ml-1 text-xs">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <Table>
      <TableHeader className="bg-muted/40">
        <TableRow>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort("recipient")}
              className="flex w-full items-center justify-start gap-1 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Получатель</span>
              {getSortIndicator("recipient")}
            </button>
          </TableHead>
          <TableHead className="w-[1%] whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleSort("status")}
              className="flex w-full items-center justify-start gap-1 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Статус</span>
              {getSortIndicator("status")}
            </button>
          </TableHead>
          <TableHead className="text-right">
            <button
              type="button"
              onClick={() => handleSort("amount")}
              className="flex w-full items-center justify-end gap-1 text-right text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Номинал</span>
              {getSortIndicator("amount")}
            </button>
          </TableHead>
          <TableHead className="text-right">
            <button
              type="button"
              onClick={() => handleSort("balance")}
              className="flex w-full items-center justify-end gap-1 text-right text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Остаток</span>
              {getSortIndicator("balance")}
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort("expiresAt")}
              className="flex w-full items-center justify-start gap-1 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Истекает</span>
              {getSortIndicator("expiresAt")}
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort("issuedAt")}
              className="flex w-full items-center justify-start gap-1 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Выдан</span>
              {getSortIndicator("issuedAt")}
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>{rows}</TableBody>
    </Table>
  );
};
