"use client";

import { Field } from "@/components/pages/certs/form/field";
import { StatusBadge } from "@/components/pages/certs/form/status-badge";
import { GiftCertificate } from "@/components/pages/certs/types";
import { formatCertDate } from "@/components/pages/certs/utils/date";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface IProps {
  cert: GiftCertificate;
  currency: Intl.NumberFormat;
  className?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
}

export const CertReadForm = ({ cert, currency, className, headerRight, footer }: IProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary/70">Детали сертификата</p>
          <h2 className="text-2xl font-semibold leading-tight text-foreground">{cert.recipient}</h2>
          <p className="text-sm text-muted-foreground">Данные только для чтения</p>
        </div>
        {headerRight}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatusBadge status={cert.status} />
        <Field label="Получатель" value={cert.recipient} />
        <Field label="Номинал" value={currency.format(cert.amount)} />
        <Field label="Остаток" value={currency.format(cert.balance)} />
        <Field label="Выдан" value={formatCertDate(cert.issuedAt)} />
        <Field label="Истекает" value={formatCertDate(cert.expiresAt)} />
        <div className="md:col-span-2">
          <Field label="Дополнительные сведения" value={cert.note?.trim() || "—"} multiline />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Чтобы появились кнопки для погашения, отсканируйте QR-код этого сертификата.
      </p>

      {footer}
    </div>
  );
};
