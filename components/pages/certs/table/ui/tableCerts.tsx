import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dispatch, SetStateAction, useMemo } from "react";
import { statusConfig } from "../../constants";
import { GiftCertificate } from "../../types";
import { formatCertDate } from "../../utils/date";

interface IProps {
  certificatesMock: GiftCertificate[];
  setSelectedCert: Dispatch<SetStateAction<GiftCertificate | null>>;
  currency: Intl.NumberFormat;
  isLoading?: boolean;
  error?: string;
}

export const TableCerts = ({
  certificatesMock,
  setSelectedCert,
  currency,
  isLoading,
  error,
}: IProps) => {
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

    return certificatesMock.map((cert) => {
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
  }, [certificatesMock, currency, error, isLoading, setSelectedCert]);

  return (
    <Table>
      <TableHeader className="bg-muted/40">
        <TableRow>
          <TableHead>Получатель</TableHead>
          <TableHead className="w-[1%] whitespace-nowrap">Статус</TableHead>
          <TableHead className="text-right">Номинал</TableHead>
          <TableHead className="text-right">Остаток</TableHead>
          <TableHead>Истекает</TableHead>
          <TableHead>Выдан</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>{rows}</TableBody>
    </Table>
  );
};
