"use client";

import { CertEvent, CertEventType } from "@/components/pages/certs/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IProps {
  events: CertEvent[];
  currency: Intl.NumberFormat;
  isLoading: boolean;
  error: string | null;
}

const getEventTypeLabel = (type: CertEventType) => {
  switch (type) {
    case "CREATED":
      return "Создание";
    case "REDEEMED":
      return "Полное погашение";
    case "PARTIAL_REDEEM":
      return "Частичное погашение";
    case "EXPIRED":
      return "Просрочка";
    case "CANCELED":
      return "Отмена";
    case "ADJUSTED":
      return "Корректировка";
    default:
      return type;
  }
};

export const CertEventsTable = ({ events, currency, isLoading, error }: IProps) => {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">История операций по сертификату</p>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка истории операций...</p>
      )}

      {error && !isLoading && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && events.length === 0 && (
        <p className="text-sm text-muted-foreground">Пока нет операций по этому сертификату.</p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="overflow-x-auto">
          <Table className="min-w-full text-left text-sm">
            <TableHeader className="border-b border-border text-xs uppercase text-muted-foreground">
              <TableRow>
                <TableHead className="px-2 py-1">Дата</TableHead>
                <TableHead className="px-2 py-1">Тип</TableHead>
                <TableHead className="px-2 py-1 text-right">Изменение</TableHead>
                <TableHead className="px-2 py-1 text-right">Баланс после</TableHead>
                <TableHead className="px-2 py-1">Комментарий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const date = new Date(event.createdAt);
                const formattedDate = `${date.toLocaleDateString(
                  "ru-RU",
                )} ${date.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;

                return (
                  <TableRow key={event.id} className="border-b border-border/50 last:border-0">
                    <TableCell className="px-2 py-1 align-top text-xs text-muted-foreground">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="px-2 py-1 align-top text-xs">
                      {getEventTypeLabel(event.eventType)}
                    </TableCell>
                    <TableCell className="px-2 py-1 align-top text-right text-xs">
                      {event.amountDelta != null ? currency.format(event.amountDelta) : "—"}
                    </TableCell>
                    <TableCell className="px-2 py-1 align-top text-right text-xs">
                      {event.balanceAfter != null ? currency.format(event.balanceAfter) : "—"}
                    </TableCell>
                    <TableCell className="px-2 py-1 align-top text-xs text-muted-foreground">
                      {event.note?.trim() || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

