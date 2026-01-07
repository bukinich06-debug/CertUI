import { Dispatch, SetStateAction } from "react";
import { GiftCertificate } from "../../types";
import { ButtonsRow } from "../buttons-row";
import { CreateCertificateForm } from "../create-certificate-form";

interface IProps {
  cardId: number;
  isCreateOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setIsCreateOpen: Dispatch<SetStateAction<boolean>>;
  onCreated: (cert: GiftCertificate) => void;
  onCertFound: (cert: GiftCertificate) => void;
  onScanSuccess?: (message: string) => void;
  onScanError?: (message: string) => void;
}

export const CertsHeader = ({
  cardId,
  isCreateOpen,
  onOpen,
  onClose,
  setIsCreateOpen,
  onCreated,
  onCertFound,
  onScanSuccess,
  onScanError,
}: IProps) => {
  return (
    <>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Подарочные сертификаты</h1>
      </header>

      <ButtonsRow
        onOpen={onOpen}
        onCertFound={onCertFound}
        onScanSuccess={onScanSuccess}
        onScanError={onScanError}
      />

      <CreateCertificateForm
        cardId={cardId}
        isCreateOpen={isCreateOpen}
        onOpen={onOpen}
        onClose={onClose}
        setIsCreateOpen={setIsCreateOpen}
        onCreated={onCreated}
      />
    </>
  );
};
