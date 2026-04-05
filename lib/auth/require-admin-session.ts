import "server-only";

import {
  isEmailInAdminAllowlist,
  parseAdminEmailAllowlist,
} from "@/lib/auth/admin-allowlist";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const ADMIN_LOGIN = "/admin/login";

/**
 * Requires Supabase session + email in `ADMIN_EMAILS`. Otherwise redirects to admin login.
 */
export async function requireAdminSession(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect(ADMIN_LOGIN);
  }
  const allowlist = parseAdminEmailAllowlist(process.env.ADMIN_EMAILS);
  if (!isEmailInAdminAllowlist(user.email, allowlist)) {
    redirect(`${ADMIN_LOGIN}?reason=forbidden`);
  }
  return user;
}
