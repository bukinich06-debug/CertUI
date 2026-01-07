import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface QrCodeData {
  qrCodeDataUrl: string | null;
  qrCodeValue: string | null;
  recipient?: string | null;
  amount?: number | string | null;
}

export interface QrCodeModalHandle {
  open: (data: QrCodeData) => void;
  close: () => void;
}

interface QrCodeModalProps {
  onClose?: () => void;
}

export const QrCodeModal = forwardRef<QrCodeModalHandle, QrCodeModalProps>(({ onClose }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrData, setQrData] = useState<QrCodeData>({ qrCodeDataUrl: null, qrCodeValue: null });

  const close = () => {
    setIsOpen(false);
    setQrData({ qrCodeDataUrl: null, qrCodeValue: null, recipient: null });
    onClose?.();
  };

  const safeFilename = (recipient?: string | null, amount?: number | string | null) => {
    const cleanedRecipient = (recipient ?? "")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, "_");
    const amountPart =
      amount !== undefined && amount !== null && `${amount}` !== "" ? `-${amount}` : "";
    return `${cleanedRecipient || "certificate"}${amountPart}-qr.png`;
  };

  const handleDownload = () => {
    if (!qrData.qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrData.qrCodeDataUrl;
    link.download = safeFilename(qrData.recipient, qrData.amount);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useImperativeHandle(ref, () => ({
    open: (data: QrCodeData) => {
      setQrData(data);
      setIsOpen(Boolean(data.qrCodeDataUrl || data.qrCodeValue));
    },
    close,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : close())}>
      <DialogContent className="max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader className="pr-8">
          <DialogTitle className="text-2xl">QR-код сертификата</DialogTitle>
          <DialogDescription>Отсканируйте или сохраните изображение</DialogDescription>
        </DialogHeader>

        {qrData.qrCodeDataUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={qrData.qrCodeDataUrl}
              alt="QR-код сертификата"
              className="h-64 w-64 rounded bg-white p-2 shadow"
            />
            {qrData.qrCodeValue && (
              <p className="text-sm text-muted-foreground">
                Код: <span className="font-mono text-foreground">{qrData.qrCodeValue}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-destructive">QR-код не сформирован</p>
        )}

        <DialogFooter className="flex w-full items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Закрыть
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleDownload}
            disabled={!qrData.qrCodeDataUrl}
          >
            <Download className="size-4" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
