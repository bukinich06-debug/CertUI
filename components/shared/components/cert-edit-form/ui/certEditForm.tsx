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
import { useEffect, useState } from "react";
import { CertReadForm } from "../../cert-read-form";
import { ConfirmRepaymant } from "../confirm-repaymant";

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
  const isRedeemed = cert?.status === "used";

  useEffect(() => {
    return () => {};
  }, []);

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
                      onClick={() => setError("Логика частичного погашения будет добавлена позже")}
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
    </>
  );
};
