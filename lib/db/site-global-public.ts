import "server-only";

import { SupabaseConfigError } from "@/lib/db/supabase-env";
import { createSupabasePublicClient } from "@/lib/db/supabase-public";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { SiteGlobalSettingsRow } from "@/types/site-global";

const ROW_ID = "default";

/**
 * Anonymous read for public Server Components (header/footer/metadata).
 * Returns `null` if Supabase is not configured, table is missing, or read fails.
 */
export async function fetchSiteGlobalSettingsPublic(): Promise<SiteGlobalSettingsRow | null> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_global_settings")
      .select("*")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("schema cache")) {
        return null;
      }
      throw supabaseReadError("site_global_settings (public)", error.message, error.code);
    }

    return data as SiteGlobalSettingsRow | null;
  } catch (e) {
    if (e instanceof SupabaseConfigError) {
      return null;
    }
    console.warn("[site-global] public read failed — using defaults.", e);
    return null;
  }
}
