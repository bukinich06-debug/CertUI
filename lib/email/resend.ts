import { Resend } from "resend";

type AuthEmailType = "verification" | "password-reset";

type SendAuthEmailParams = {
  type: AuthEmailType;
  to: string;
  url: string;
  userName?: string | null;
  idempotencyKey: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.AUTH_FROM_EMAIL ??
  process.env.RESEND_FROM_EMAIL ??
  process.env.EMAIL_FROM;
const resendReplyTo = process.env.AUTH_REPLY_TO_EMAIL ?? process.env.RESEND_REPLY_TO_EMAIL;
const forceConsoleDelivery =
  process.env.AUTH_EMAIL_TRANSPORT === "console" || process.env.AUTH_EMAIL_DEV_TO_TERMINAL === "true";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildAuthEmail = (params: Omit<SendAuthEmailParams, "idempotencyKey">) => {
  const recipientName = params.userName?.trim() || "there";
  const safeRecipientName = escapeHtml(recipientName);
  const safeUrl = escapeHtml(params.url);

  if (params.type === "verification") {
    return {
      subject: "Подтвердите email для входа в Cert UI",
      text: `Здравствуйте, ${recipientName}!\n\nПодтвердите ваш email, перейдя по ссылке: ${params.url}\n\nЕсли вы не создавали аккаунт, просто проигнорируйте это письмо.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 16px;">Подтвердите email</h2>
          <p>Здравствуйте, ${safeRecipientName}!</p>
          <p>Чтобы завершить регистрацию и включить вход по email, подтвердите ваш адрес.</p>
          <p style="margin: 24px 0;">
            <a
              href="${safeUrl}"
              style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #111827; color: #ffffff; text-decoration: none;"
            >
              Подтвердить email
            </a>
          </p>
          <p>Если кнопка не открывается, используйте эту ссылку:</p>
          <p><a href="${safeUrl}">${safeUrl}</a></p>
          <p>Если вы не создавали аккаунт, просто проигнорируйте это письмо.</p>
        </div>
      `,
    };
  }

  return {
    subject: "Сброс пароля для Cert UI",
    text: `Здравствуйте, ${recipientName}!\n\nЧтобы задать новый пароль, перейдите по ссылке: ${params.url}\n\nЕсли вы не запрашивали сброс пароля, проигнорируйте это письмо.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 16px;">Сброс пароля</h2>
        <p>Здравствуйте, ${safeRecipientName}!</p>
        <p>Мы получили запрос на смену пароля для вашего аккаунта.</p>
        <p style="margin: 24px 0;">
          <a
            href="${safeUrl}"
            style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #111827; color: #ffffff; text-decoration: none;"
          >
            Задать новый пароль
          </a>
        </p>
        <p>Если кнопка не открывается, используйте эту ссылку:</p>
        <p><a href="${safeUrl}">${safeUrl}</a></p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      </div>
    `,
  };
};

const logFallbackLink = (params: SendAuthEmailParams) => {
  const label = params.type === "verification" ? "EMAIL VERIFICATION" : "PASSWORD RESET";

  console.info("");
  console.info("=".repeat(72));
  console.info(`[AUTH EMAIL DEV MODE] ${label}`);
  console.info(`Recipient: ${params.to}`);
  console.info(`URL: ${params.url}`);
  console.info("=".repeat(72));
  console.info("");
};

export const sendAuthEmail = async (params: SendAuthEmailParams) => {
  if (forceConsoleDelivery || !resend || !resendFromEmail) {
    logFallbackLink(params);
    return;
  }

  const email = buildAuthEmail(params);

  const { error } = await resend.emails.send(
    {
      from: resendFromEmail,
      to: [params.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: resendReplyTo ? [resendReplyTo] : undefined,
      tags: [
        {
          name: "category",
          value: params.type === "verification" ? "email_verification" : "password_reset",
        },
      ],
    },
    {
      idempotencyKey: params.idempotencyKey,
    },
  );

  if (error) {
    throw new Error(`Failed to send auth email: ${error.message}`);
  }
};
