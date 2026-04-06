import "server-only";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { SiteLandingSettingsRow } from "@/types/site-landing";

const ROW_ID = "default";

export async function getSiteLandingSettingsForAdmin(): Promise<SiteLandingSettingsRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_landing_settings")
    .select("*")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("site_landing_settings (admin)", error.message, error.code);
  }

  return data as SiteLandingSettingsRow | null;
}

export type SiteLandingUpsertPayload = {
  hero_title: string;
  hero_subtitle: string;
  hero_image_urls: string[];
  hero_link_1_label: string | null;
  hero_link_1_href: string | null;
  hero_link_2_label: string | null;
  hero_link_2_href: string | null;
  featured_project_ids: string[];
  hero_interval_seconds: number;
};

export async function upsertSiteLandingSettings(
  input: SiteLandingUpsertPayload,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_landing_settings").upsert({
    id: ROW_ID,
    hero_title: input.hero_title,
    hero_subtitle: input.hero_subtitle,
    hero_image_urls: input.hero_image_urls,
    hero_link_1_label: input.hero_link_1_label,
    hero_link_1_href: input.hero_link_1_href,
    hero_link_2_label: input.hero_link_2_label,
    hero_link_2_href: input.hero_link_2_href,
    featured_project_ids: input.featured_project_ids,
    hero_interval_seconds: input.hero_interval_seconds,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw supabaseReadError("site_landing_settings upsert", error.message, error.code);
  }
}
