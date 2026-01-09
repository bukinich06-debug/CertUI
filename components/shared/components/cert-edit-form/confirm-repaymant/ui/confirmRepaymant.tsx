"use client";

import { GiftCertificate } from "@/components/pages/certs/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeRequest } from "@/lib/makeRequest";

interface Iprops {
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  cert: GiftCertificate;
  currency: Intl.NumberFormat;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onSuccess?: (updated: GiftCertificate) => void;
  setError?: (msg: string | null) => void;
  onSuccessMessage?: (message: string) => void;
}

export const ConfirmRepaymant = ({
  showConfirm,
  setShowConfirm,
  cert,
  currency,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
  setError,
  onSuccessMessage,
}: Iprops) => {
  const amountToShow = cert.balance > 0 ? cert.balance : cert.amount;

  const handleRedeemFull = async () => {
    if (!cert.code) {
      setError?.("У сертификата отсутствует код");
      return;
    }

    setIsSubmitting(true);
    setError?.(null);

    try {
      const res = await makeRequest("/api/redeemCert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cert.code }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Запрос не выполнен со статусом ${res.status}`;
        throw new Error(message);
      }

      const updated = (await res.json()) as GiftCertificate;
      onSuccess?.(updated);
      onSuccessMessage?.("Сертификат успешно погашен");
      setShowConfirm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось погасить сертификат";
      setError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showConfirm} onOpenChange={(open) => (!open ? setShowConfirm(false) : null)}>
      <DialogContent className="max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-destructive">Подтверждение погашения</DialogTitle>
          <DialogDescription>
            Вы собираетесь полностью погасить сертификат получателя{" "}
            <span className="font-semibold text-foreground">{cert.recipient}</span> на сумму{" "}
            <span className="font-semibold text-foreground">{currency.format(amountToShow)}</span>.
            Продолжить?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setShowConfirm(false);
              void handleRedeemFull();
            }}
            disabled={isSubmitting}
          >
            Погасить полностью
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
