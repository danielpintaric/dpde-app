import "server-only";

import {
  isEmailInAdminAllowlist,
  parseAdminEmailAllowlist,
} from "@/lib/auth/admin-allowlist";
import { getSessionUser } from "@/lib/auth/session";
import type { User } from "@supabase/supabase-js";

export type AdminApiAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Admin-Session für Route Handler: kein redirect(), nur Status + Fehlertext.
 */
export async function requireAdminUserForApi(): Promise<AdminApiAuthResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, status: 401, error: "Nicht angemeldet." };
  }
  const allowlist = parseAdminEmailAllowlist(process.env.ADMIN_EMAILS);
  if (!isEmailInAdminAllowlist(user.email, allowlist)) {
    return { ok: false, status: 403, error: "Keine Berechtigung." };
  }
  return { ok: true, user };
}
