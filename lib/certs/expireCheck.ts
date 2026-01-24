import { prisma } from "@/lib/prisma";

/**
 * Обновляет статус просроченных сертификатов с "active" на "expired"
 * @returns количество обновленных сертификатов
 */
export async function expireCertificates(): Promise<number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Находим все активные сертификаты с истекшим сроком действия
  const expiredCerts = await prisma.certs.findMany({
    where: {
      status: "active",
      expires_at: {
        not: null,
        lt: today,
      },
    },
    select: {
      id: true,
      balance: true,
    },
  });

  if (expiredCerts.length === 0) {
    return 0;
  }

  const certIds = expiredCerts.map((cert) => cert.id);

  // Обновляем статус на "expired" и обновляем updated_at
  await prisma.$transaction(async (tx) => {
    // Обновляем статус сертификатов
    await tx.certs.updateMany({
      where: {
        id: { in: certIds },
      },
      data: {
        status: "expired",
        updated_at: new Date(),
      },
    });

    // Создаем события EXPIRED для каждого сертификата
    const expiredEvents = expiredCerts.map((cert) => ({
      cert_id: cert.id,
      event_type: "EXPIRED" as const,
      amount_delta: null,
      balance_after: cert.balance,
      note: "Сертификат просрочен автоматически",
    }));

    await tx.cert_events.createMany({
      data: expiredEvents,
    });
  });

  return expiredCerts.length;
}
