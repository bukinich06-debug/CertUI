import { CertReadForm } from "@/components/shared/components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SetStateAction } from "react";
import { GiftCertificate } from "../../types";

interface IProps {
  selectedCert: GiftCertificate | null;
  setSelectedCert: (value: SetStateAction<GiftCertificate | null>) => void;
  currency: Intl.NumberFormat;
}

export const FormModal = ({ selectedCert, setSelectedCert, currency }: IProps) => {
  if (!selectedCert) return null;

  return (
    <Dialog
      open={Boolean(selectedCert)}
      onOpenChange={(open: boolean) => !open && setSelectedCert(null)}
    >
      <DialogContent className="max-w-2xl" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogTitle className="sr-only">Данные сертификата</DialogTitle>
        <CertReadForm cert={selectedCert} currency={currency} />

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
