export const authMethods = ["email", "google", "vk", "yandex", "mailru"] as const;
export type AuthMethod = (typeof authMethods)[number];
