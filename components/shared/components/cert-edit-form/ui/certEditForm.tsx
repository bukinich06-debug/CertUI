"use client";

import { CertEvent, GiftCertificate } from "@/components/pages/certs/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeRequest } from "@/lib/makeRequest";
import { useEffect, useState } from "react";
import { CertReadForm } from "../../cert-read-form";
import { ConfirmRepaymant } from "../confirm-repaymant";
import { ConfirmPartialRepaymant } from "../partial-repaymant";
import { CertEventsTable } from "../events-table";

interface Iprops {
  cert: GiftCertificate | null;
  currency: Intl.NumberFormat;
  onClose: () => void;
  onSuccessMessage?: (message: string) => void;
  onRedeemSuccess?: () => void | Promise<void>;
}

export const CertEditForm = ({
  cert,
  currency,
  onClose,
  onSuccessMessage,
  onRedeemSuccess,
}: Iprops) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPartialConfirm, setShowPartialConfirm] = useState(false);
  const [events, setEvents] = useState<CertEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const isRedeemed = cert?.status === "used";

  useEffect(() => {
    if (!cert?.code) {
      setEvents([]);
      setEventsError(null);
      return;
    }

    let cancelled = false;

    const fetchEvents = async () => {
      setIsEventsLoading(true);
      setEventsError(null);

      try {
        const res = await makeRequest(`/api/certEvents?code=${encodeURIComponent(cert.code || "")}`);

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
  }, [cert?.code]);

  const handleSuccess = async () => {
    await onRedeemSuccess?.();
    onClose();
  };

  if (!cert) return null;

  return (
    <>
      <Dialog open={Boolean(cert)} onOpenChange={(open) => (!open ? onClose() : null)}>
        <DialogContent className="max-w-3xl" onOpenAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader className="pr-8">
            <DialogTitle className="text-2xl">Погашение сертификата</DialogTitle>
            <DialogDescription>
              Сканирование выявило сертификат. Можно погасить полностью или частично.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <CertReadForm cert={cert} currency={currency} hideReadOnlyLabels={true} />

            <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Действия</p>

              {isRedeemed ? (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
                  Сертификат уже погашен — операции недоступны.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setError(null);
                        setShowPartialConfirm(true);
                      }}
                      disabled={isSubmitting}
                    >
                      Погасить частично
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowConfirm(true)}
                      disabled={isSubmitting}
                    >
                      Погасить полностью
                    </Button>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </>
              )}
            </div>

            <CertEventsTable
              events={events}
              currency={currency}
              isLoading={isEventsLoading}
              error={eventsError}
            />

            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmRepaymant
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        cert={cert}
        currency={currency}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        setError={setError}
        onSuccess={handleSuccess}
        onSuccessMessage={onSuccessMessage}
      />

      <ConfirmPartialRepaymant
        showConfirm={showPartialConfirm}
        setShowConfirm={setShowPartialConfirm}
        cert={cert}
        currency={currency}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        setError={setError}
        onSuccess={handleSuccess}
        onSuccessMessage={onSuccessMessage}
      />
    </>
  );
};
