import "server-only";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { User } from "@supabase/supabase-js";

/**
 * Current Supabase Auth user (server). Returns null if no session or config error.
 */
export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
