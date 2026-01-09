import { GiftCertificate } from "../types";

export const fetchCertByCode = async (code: string) => {
    const res = await fetch(`/api/certByCode?code=${encodeURIComponent(code)}`);

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Запрос не выполнен со статусом ${res.status}`;
        throw new Error(message);
    }
    
    return (await res.json()) as GiftCertificate;
};