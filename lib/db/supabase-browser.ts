"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/db/supabase-env";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (Client Components). Uses anon key + RLS.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicConfig();
  return createBrowserClient(url, anonKey);
}
