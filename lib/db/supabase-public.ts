import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/db/supabase-env";

/**
 * Anonymous Supabase client for public reads (no cookies, no request/session).
 * Use for SSG, `generateStaticParams()`, and other build-time or cookie-free paths.
 * RLS applies as for an unauthenticated user.
 *
 * For auth-dependent reads/writes, use {@link createSupabaseServerClient} instead.
 */
export function createSupabasePublicClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicConfig();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
