"use client";

import { GiftCertificate } from "@/components/pages/certs/types";
import { Button } from "@/components/ui/button";
import { BrowserQRCodeReader } from "@zxing/browser";
import { FilePlus2, Loader2, SearchCheck } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface IProps {
  onOpen: () => void;
  onCertFound?: (cert: GiftCertificate) => void;
  onScanSuccess?: (message: string) => void;
  onScanError?: (message: string) => void;
}

const extractCode = (raw: string): string | null => {
  try {
    const url = new URL(raw);
    const codeFromUrl = url.searchParams.get("code");
    if (codeFromUrl) return codeFromUrl;
  } catch {
    // not a full URL, fallback to regex
  }

  const codeParamMatch = raw.match(/code=([^&\s]+)/i);
  if (codeParamMatch?.[1]) return codeParamMatch[1];

  const uuidMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return uuidMatch?.[0] ?? null;
};

const fetchCertByCode = async (code: string) => {
  const res = await fetch(`/api/certByCode?code=${encodeURIComponent(code)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error ?? `Запрос не выполнен со статусом ${res.status}`;
    throw new Error(message);
  }
  return (await res.json()) as GiftCertificate;
};

export const ButtonsRow = ({ onOpen, onCertFound, onScanSuccess, onScanError }: IProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const pickFile = () => {
    fileInputRef.current?.click();
  };

  const readAsDataUrl = async (file: File) => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
      reader.readAsDataURL(file);
    });
    return dataUrl;
  };

  const decodeFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);

    try {
      readerRef.current ??= new BrowserQRCodeReader();
      const dataUrl = await readAsDataUrl(file);
      const result = await readerRef.current.decodeFromImageUrl(dataUrl);
      const decodedText = result.getText();

      const code = extractCode(decodedText);
      if (!code) throw new Error("В QR не найден код сертификата");

      const cert = await fetchCertByCode(code);
      onCertFound?.(cert);
      onScanSuccess?.("QR-код распознан, сертификат найден");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось распознать QR-код";
      onScanError?.(message);
    } finally {
      setIsDecoding(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button className="h-12 justify-center text-base font-semibold" onClick={onOpen}>
          <FilePlus2 className="size-5" />
          Создать сертификат
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 justify-center text-base font-semibold"
          onClick={pickFile}
          disabled={isDecoding}
        >
          {isDecoding ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SearchCheck className="size-5" />
          )}
          {isDecoding ? "Сканирование..." : "Проверить сертификат"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={decodeFromFile}
        />
      </div>
    </div>
  );
};
