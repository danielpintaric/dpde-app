/**
 * Admin email allowlist (V1). Safe for Edge middleware and Node.
 * Env: `ADMIN_EMAILS` — comma-separated, case-insensitive.
 * Empty / unset → no admin access (configure explicitly).
 */

export function parseAdminEmailAllowlist(envValue: string | undefined): Set<string> {
  if (!envValue?.trim()) {
    return new Set();
  }
  return new Set(
    envValue
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isEmailInAdminAllowlist(
  email: string | undefined,
  allowlist: Set<string>,
): boolean {
  if (!email?.trim() || allowlist.size === 0) {
    return false;
  }
  return allowlist.has(email.trim().toLowerCase());
}
