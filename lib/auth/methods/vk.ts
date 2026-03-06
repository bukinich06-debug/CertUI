import { env } from "@/lib/env";

export function getVkProvider(isEnabled: boolean) {
  if (!isEnabled || !env.VK_CLIENT_ID || !env.VK_CLIENT_SECRET) {
    return {};
  }
  return {
    vk: {
      clientId: env.VK_CLIENT_ID,
      clientSecret: env.VK_CLIENT_SECRET,
    },
  };
}
