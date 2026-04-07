import "server-only";

import { SupabaseConfigError } from "@/lib/db/supabase-env";
import { createSupabasePublicClient } from "@/lib/db/supabase-public";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { SiteLandingSettingsRow } from "@/types/site-landing";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";

/**
 * Anonymous read of homepage landing config (homepage Server Components).
 * Returns `null` if Supabase is not configured, table is missing, or read fails.
 */
export async function fetchSiteLandingSettingsPublic(
  siteId: string = DEFAULT_SITE_ID,
): Promise<SiteLandingSettingsRow | null> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_landing_settings")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("schema cache")) {
        return null;
      }
      throw supabaseReadError("site_landing_settings (public)", error.message, error.code);
    }

    return data as SiteLandingSettingsRow | null;
  } catch (e) {
    if (e instanceof SupabaseConfigError) {
      return null;
    }
    console.warn("[site-landing] public read failed — using defaults.", e);
    return null;
  }
}
