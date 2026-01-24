import { expireCertificates } from "@/lib/certs/expireCheck";
import { NextResponse } from "next/server";

/**
 * Cron job для обновления статусов просроченных сертификатов
 * Выполняется каждый день в полночь (00:00 UTC)
 * 
 * Для Vercel: настройка через vercel.json (см. vercel.json в корне проекта)
 * Для других платформ: настройте внешний cron сервис на вызов этого endpoint
 * с заголовком Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  try {
    // Проверка авторизации для Vercel Cron
    // Vercel автоматически добавляет заголовок 'x-vercel-cron' со значением '1' при вызове из cron
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Для Vercel Cron: проверяем специальный заголовок
    // Для внешних cron сервисов: проверяем секретный токен
    if (vercelCronHeader !== "1") {
      // Это не вызов от Vercel Cron, проверяем секретный токен (если настроен)
      if (cronSecret) {
        if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      } else {
        // Если секретный токен не настроен и это не Vercel Cron - отклоняем запрос
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log(`[Cron] Запуск проверки просроченных сертификатов в ${new Date().toISOString()}`);

    const expiredCount = await expireCertificates();

    const response = {
      success: true,
      message: `Обновлено сертификатов: ${expiredCount}`,
      expiredCount,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Cron] Проверка завершена: ${expiredCount} сертификатов обновлено`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Cron] Ошибка при обновлении просроченных сертификатов:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
