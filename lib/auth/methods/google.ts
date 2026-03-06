import { env } from "@/lib/env";

export function getGoogleProvider(isEnabled: boolean) {
  if (!isEnabled || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return {};
  }
  return {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  };
}
