export type GiftStatus = "active" | "used" | "expired";

export type GiftCertificate = {
  code?: string;
  recipient: string;
  amount: number;
  balance: number;
  issuedAt: string;
  expiresAt: string | null;
  status: GiftStatus;
  note?: string | null;
  qrCodeDataUrl?: string;
};

export type CreateGiftCertificate = {
  cardId: number;
  recipient: string;
  amount: number;
  expiresAt: string | null;
  note?: string | null;
};

export type DraftCertificate = {
  recipient: GiftCertificate["recipient"];
  amount: GiftCertificate["amount"] | "";
  issuedAt: GiftCertificate["issuedAt"];
  hasExpiry: boolean;
  expiresAt: GiftCertificate["expiresAt"];
  note: string;
};