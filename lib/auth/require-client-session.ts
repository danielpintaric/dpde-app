import "server-only";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import type { User } from "@supabase/supabase-js";

const CLIENT_LOGIN = "/client/login";

/** V1: any authenticated Supabase user may view the client workspace (no per-project ACL yet). */
export async function requireClientSessionUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect(CLIENT_LOGIN);
  }
  return user;
}
