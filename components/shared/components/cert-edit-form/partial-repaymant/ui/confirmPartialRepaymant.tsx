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
import { ChangeEvent, useState } from "react";

interface IProps {
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

export const ConfirmPartialRepaymant = ({
  showConfirm,
  setShowConfirm,
  cert,
  currency,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
  setError,
  onSuccessMessage,
}: IProps) => {
  const [amount, setAmount] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  const onAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
    setLocalError(null);
  };

  const handlePartialRedeem = async () => {
    if (!cert.code) {
      setError?.("У сертификата отсутствует код");
      return;
    }

    const parsed = Number.parseFloat(amount.replace(",", "."));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLocalError("Введите корректную сумму погашения");
      return;
    }

    const rounded = Math.round(parsed * 100) / 100;

    if (rounded <= 0) {
      setLocalError("Сумма погашения должна быть больше нуля");
      return;
    }

    if (rounded > cert.balance) {
      setLocalError("Сумма погашения не может превышать остаток по сертификату");
      return;
    }

    setIsSubmitting(true);
    setError?.(null);

    try {
      const res = await makeRequest("/api/partialRedeemCert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cert.code, amount: rounded }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Запрос не выполнен со статусом ${res.status}`;
        throw new Error(message);
      }

      const updated = (await res.json()) as GiftCertificate;
      onSuccess?.(updated);
      onSuccessMessage?.("Сертификат частично погашен");
      setShowConfirm(false);
      setAmount("");
      setLocalError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось частично погасить сертификат";
      setError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountToShow = cert.balance > 0 ? cert.balance : cert.amount;

  return (
    <Dialog open={showConfirm} onOpenChange={(open) => (!open ? setShowConfirm(false) : null)}>
      <DialogContent className="max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Частичное погашение сертификата</DialogTitle>
          <DialogDescription>
            Текущий остаток сертификата получателя{" "}
            <span className="font-semibold text-foreground">{cert.recipient}</span> составляет{" "}
            <span className="font-semibold text-foreground">{currency.format(amountToShow)}</span>. Укажите
            сумму, на которую вы хотите частично погасить сертификат.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="partial-amount">
              Сумма частичного погашения
            </label>
            <input
              id="partial-amount"
              type="number"
              step="0.01"
              min="0"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={amount}
              onChange={onAmountChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Не более {currency.format(cert.balance)}. Значение округляется до двух знаков после запятой.
            </p>
            {localError && <p className="text-xs text-destructive">{localError}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setAmount("");
                setLocalError(null);
              }}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowConfirm(false);
                void handlePartialRedeem();
              }}
              disabled={isSubmitting}
            >
              Погасить частично
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

