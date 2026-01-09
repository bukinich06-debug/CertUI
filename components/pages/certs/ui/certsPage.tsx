"use client";

import { CertEditForm } from "@/components/shared/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeRequest } from "@/lib/makeRequest";
import { useSearchParams } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CertsBreadcrumb } from "../breadcrumb";
import { FormModal } from "../form";
import { CertsHeader } from "../header";
import { TableCerts } from "../table";
import { GiftCertificate } from "../types";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export const CertsPage: FC = () => {
  const searchParams = useSearchParams();
  const certsId = useMemo(() => {
    const raw = searchParams.get("cardId") ?? searchParams.get("id");
    const parsed = raw !== null ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const [certificates, setCertificates] = useState<GiftCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<GiftCertificate | null>(null);
  const [redeemCert, setRedeemCert] = useState<GiftCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await makeRequest(`/api/certs?id=${encodeURIComponent(certsId)}`);

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = (await res.json()) as GiftCertificate[];
      if (isMountedRef.current) setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isMountedRef.current) {
        setCertificates([]);
        setError("Не удалось загрузить сертификаты");
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [certsId]);

  useEffect(() => {
    setIsMounted(true);
    isMountedRef.current = true;
    void fetchCertificates();

    return () => {
      isMountedRef.current = false;
      setIsMounted(false);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, [certsId, fetchCertificates]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showScanError = (message: string) => {
    setScanErrorMessage(message);
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <CertsBreadcrumb />

      {isMounted &&
        successMessage &&
        createPortal(
          <div className="pointer-events-none fixed left-1/2 top-8 z-[120] w-full max-w-xl -translate-x-1/2 px-4">
            <div className="rounded-md border border-green-500/60 bg-green-50 px-4 py-3 text-sm text-green-900 shadow-md">
              {successMessage}
            </div>
          </div>,
          document.body,
        )}

      <Dialog
        open={Boolean(scanErrorMessage)}
        onOpenChange={(open) => (!open ? setScanErrorMessage(null) : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка доступа к сертификату</DialogTitle>
            <DialogDescription>{scanErrorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setScanErrorMessage(null)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CertsHeader
        cardId={certsId}
        isCreateOpen={isCreateOpen}
        onOpen={() => setIsCreateOpen(true)}
        onClose={() => setIsCreateOpen(false)}
        setIsCreateOpen={setIsCreateOpen}
        onCreated={(created) => setCertificates((prev) => [created, ...prev])}
        onCertFound={setRedeemCert}
        onScanSuccess={showSuccessMessage}
        onScanError={showScanError}
      />

      {isLoading && (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          Загрузка сертификатов...
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm backdrop-blur">
        <TableCerts
          certificatesMock={certificates}
          setSelectedCert={setSelectedCert}
          currency={currency}
        />
      </div>

      <FormModal
        selectedCert={selectedCert}
        setSelectedCert={setSelectedCert}
        currency={currency}
      />

      <CertEditForm
        cert={redeemCert}
        currency={currency}
        onClose={() => setRedeemCert(null)}
        onSuccessMessage={showSuccessMessage}
        onRedeemSuccess={fetchCertificates}
      />
    </section>
  );
};
