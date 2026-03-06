const parseBooleanEnv = (value: string | undefined) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const explicitEmailAuthEnabled = parseBooleanEnv(process.env.EMAIL_AUTH_ENABLED);

export const isEmailAuthEnabled =
  explicitEmailAuthEnabled ?? process.env.NODE_ENV !== "production";
