import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { makeRequest } from "@/lib/makeRequest";
import { Label } from "@radix-ui/react-label";
import { FilePlus2 } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useRef, useState } from "react";
import { CreateGiftCertificate, DraftCertificate, GiftCertificate } from "../../../types";
import { QrCodeModal, QrCodeModalHandle } from "../qr-modal";

const todayIso = () => new Date().toISOString().slice(0, 10);
const tomorrowIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const createInitialDraft = (): DraftCertificate => ({
  recipient: "",
  amount: "",
  issuedAt: todayIso(),
  hasExpiry: true,
  expiresAt: "",
  note: "",
});

interface IProps {
  cardId: number;
  isCreateOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setIsCreateOpen: Dispatch<SetStateAction<boolean>>;
  onCreated: (cert: GiftCertificate) => void;
}

export const CreateCertificateForm = ({
  cardId,
  isCreateOpen,
  onOpen,
  onClose,
  setIsCreateOpen,
  onCreated,
}: IProps) => {
  const [draftCert, setDraftCert] = useState<DraftCertificate>(createInitialDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const qrModalRef = useRef<QrCodeModalHandle>(null);

  const resetDraft = () => setDraftCert(createInitialDraft());

  const onDraftChange = <K extends keyof DraftCertificate>(key: K, value: DraftCertificate[K]) =>
    setDraftCert((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSaving(true);

    const normalized: CreateGiftCertificate = {
      cardId,
      recipient: draftCert.recipient,
      amount: Number(draftCert.amount) || 0,
      expiresAt: draftCert.hasExpiry ? draftCert.expiresAt : null,
      note: draftCert.note.trim() ? draftCert.note.trim() : null,
    };

    try {
      const res = await makeRequest("/api/createCert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error || `Запрос не выполнен со статусом ${res.status}`);
      }

      const created = (await res.json()) as GiftCertificate & {
        qrCodeDataUrl?: string;
        code?: string;
      };
      onCreated(created);

      qrModalRef.current?.open({
        qrCodeDataUrl: created.qrCodeDataUrl ?? null,
        qrCodeValue: created.code ?? null,
        recipient: created.recipient ?? draftCert.recipient ?? null,
        amount: created.amount ?? draftCert.amount ?? null,
      });

      setIsCreateOpen(false);
      resetDraft();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось создать сертификат";
      setSubmitError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const onCloseDialog = () => {
    onClose();
    resetDraft();
  };

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? onOpen() : onCloseDialog())}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-2xl">Создать сертификат</DialogTitle>
            <DialogDescription>Заполните данные и сохраните</DialogDescription>
          </DialogHeader>

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Получатель
              </Label>
              <Input
                value={draftCert.recipient}
                onChange={(e) => onDraftChange("recipient", e.target.value)}
                placeholder="Имя получателя"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Номинал
              </Label>
              <Input
                type="number"
                min={1}
                value={draftCert.amount === "" ? "" : draftCert.amount}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/^0+(?=\d)/, "");
                  onDraftChange("amount", sanitized === "" ? "" : Number(sanitized));
                }}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Выдан</Label>
              <Input
                type="date"
                value={draftCert.issuedAt}
                readOnly
                disabled
                className="bg-muted/60 text-muted-foreground"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draftCert.hasExpiry}
                  onChange={(e) => onDraftChange("hasExpiry", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Есть срок действия
                </Label>
              </div>
              <Input
                type="date"
                value={draftCert.expiresAt ?? ""}
                onChange={(e) => onDraftChange("expiresAt", e.target.value)}
                disabled={!draftCert.hasExpiry}
                required={draftCert.hasExpiry}
                min={tomorrowIso()}
                className={!draftCert.hasExpiry ? "bg-muted/60 text-muted-foreground" : ""}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Дополнительная информация
              </Label>
              <Textarea
                value={draftCert.note}
                onChange={(e) => onDraftChange("note", e.target.value)}
                placeholder="Комментарии, условия использования или пожелания"
                className="flex min-h-[120px] w-full bg-transparent text-base placeholder:text-muted-foreground md:text-sm"
              />
            </div>

            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={onCloseDialog}>
                Отмена
              </Button>
              <Button type="submit" className="gap-2" disabled={isSaving}>
                <FilePlus2 className="size-4" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>

            {submitError && <p className="md:col-span-2 text-sm text-destructive">{submitError}</p>}
          </form>
        </DialogContent>
      </Dialog>

      <QrCodeModal ref={qrModalRef} />
    </>
  );
};
