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
  /** Three slots: lead, support 1, support 2 — `null` preserves empty middle slots in JSON. */
  featured_project_ids: (string | null)[];
  hero_interval_seconds: number;
  home_selected_work_label: string | null;
  home_more_work_label: string | null;
  home_show_selected_work: boolean;
  home_show_more_work: boolean;
  home_show_approach: boolean;
  home_approach_kicker: string | null;
  home_approach_title: string | null;
  home_approach_body: string | null;
  home_approach_image_url: string | null;
  home_approach_cta_label: string | null;
  home_approach_cta_href: string | null;
  home_more_work_mode: "auto" | "manual";
  home_more_work_count: number;
  home_more_work_manual_project_ids: string[];
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
    home_selected_work_label: input.home_selected_work_label,
    home_more_work_label: input.home_more_work_label,
    home_show_selected_work: input.home_show_selected_work,
    home_show_more_work: input.home_show_more_work,
    home_show_approach: input.home_show_approach,
    home_approach_kicker: input.home_approach_kicker,
    home_approach_title: input.home_approach_title,
    home_approach_body: input.home_approach_body,
    home_approach_image_url: input.home_approach_image_url,
    home_approach_cta_label: input.home_approach_cta_label,
    home_approach_cta_href: input.home_approach_cta_href,
    home_more_work_mode: input.home_more_work_mode,
    home_more_work_count: input.home_more_work_count,
    home_more_work_manual_project_ids: input.home_more_work_manual_project_ids,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw supabaseReadError("site_landing_settings upsert", error.message, error.code);
  }
}
