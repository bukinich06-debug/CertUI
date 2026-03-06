import type { sendAuthEmail } from "@/lib/email/resend";

export type GetEmailConfigParams = {
  sendAuthEmail: typeof sendAuthEmail;
  isEmailEnabled: boolean;
};

export function getEmailConfig({ sendAuthEmail: sendEmail, isEmailEnabled }: GetEmailConfigParams) {
  return {
    emailAndPassword: {
      enabled: isEmailEnabled,
      autoSignIn: false,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({
        user,
        url,
        token,
      }: {
        user: { email: string; name: string; id: string };
        url: string;
        token: string;
      }) => {
        await sendEmail({
          type: "password-reset",
          to: user.email,
          url,
          userName: user.name,
          idempotencyKey: `password-reset/${user.id}/${token}`,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({
        user,
        url,
        token,
      }: {
        user: { email: string; name: string; id: string };
        url: string;
        token: string;
      }) => {
        await sendEmail({
          type: "verification",
          to: user.email,
          url,
          userName: user.name,
          idempotencyKey: `email-verification/${user.id}/${token}`,
        });
      },
    },
  };
}
