import { CertReadForm } from "@/components/shared/components";
import { CertEventsTable } from "@/components/shared/components/cert-edit-form/events-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { makeRequest } from "@/lib/makeRequest";
import { SetStateAction, useEffect, useState } from "react";
import { CertEvent, GiftCertificate } from "../../types";

interface IProps {
  selectedCert: GiftCertificate | null;
  setSelectedCert: (value: SetStateAction<GiftCertificate | null>) => void;
  currency: Intl.NumberFormat;
}

export const FormModal = ({ selectedCert, setSelectedCert, currency }: IProps) => {
  const [events, setEvents] = useState<CertEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCert?.code) {
      setEvents([]);
      setEventsError(null);
      return;
    }

    let cancelled = false;

    const fetchEvents = async () => {
      setIsEventsLoading(true);
      setEventsError(null);

      try {
        const res = await makeRequest(
          `/api/certEvents?code=${encodeURIComponent(selectedCert.code || "")}`,
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message = body?.error ?? `Запрос истории не выполнен со статусом ${res.status}`;
          throw new Error(message);
        }

        const data = (await res.json()) as CertEvent[];
        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Не удалось загрузить историю операций";
          setEventsError(message);
        }
      } finally {
        if (!cancelled) {
          setIsEventsLoading(false);
        }
      }
    };

    void fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [selectedCert?.code]);

  if (!selectedCert) return null;

  return (
    <Dialog
      open={Boolean(selectedCert)}
      onOpenChange={(open: boolean) => !open && setSelectedCert(null)}
    >
      <DialogContent className="max-w-2xl" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogTitle className="sr-only">Данные сертификата</DialogTitle>
        <CertReadForm cert={selectedCert} currency={currency} />

        <div className="mt-6">
          <CertEventsTable
            events={events}
            currency={currency}
            isLoading={isEventsLoading}
            error={eventsError}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setSelectedCert(null)}>
              Закрыть
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
