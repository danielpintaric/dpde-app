import "server-only";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { SiteGlobalNavItem, SiteGlobalSettingsRow } from "@/types/site-global";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";

const ROW_ID = "default";

export async function getSiteGlobalSettingsForAdmin(): Promise<SiteGlobalSettingsRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_global_settings")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("site_global_settings (admin)", error.message, error.code);
  }

  return data as SiteGlobalSettingsRow | null;
}

export type SiteGlobalUpsertPayload = {
  brand_name: string;
  wordmark_text: string | null;
  logo_image_url: string | null;
  copyright_holder: string | null;
  footer_tagline: string | null;
  /** `""` when cleared; valid email otherwise. */
  footer_email: string;
  footer_instagram_url: string | null;
  footer_instagram_label: string | null;
  footer_cta_href: string | null;
  footer_cta_label: string | null;
  footer_extra_url: string | null;
  footer_extra_label: string | null;
  location_city: string | null;
  bio_line: string | null;
  primary_contact_label: string | null;
  logo_home_href: string | null;
  header_brand_label: string | null;
  navigation_items: SiteGlobalNavItem[];
  header_cta_label: string | null;
  header_cta_href: string | null;
  contact_phone: string | null;
};

export async function upsertSiteGlobalSettings(input: SiteGlobalUpsertPayload): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_global_settings").upsert(
    {
      id: ROW_ID,
      site_id: DEFAULT_SITE_ID,
      brand_name: input.brand_name,
      wordmark_text: input.wordmark_text,
      logo_image_url: input.logo_image_url,
      copyright_holder: input.copyright_holder,
      footer_tagline: input.footer_tagline,
      footer_email: input.footer_email,
      footer_instagram_url: input.footer_instagram_url,
      footer_instagram_label: input.footer_instagram_label,
      footer_cta_href: input.footer_cta_href,
      footer_cta_label: input.footer_cta_label,
      footer_extra_url: input.footer_extra_url,
      footer_extra_label: input.footer_extra_label,
      location_city: input.location_city,
      bio_line: input.bio_line,
      primary_contact_label: input.primary_contact_label,
      logo_home_href: input.logo_home_href,
      header_brand_label: input.header_brand_label,
      navigation_items: input.navigation_items,
      header_cta_label: input.header_cta_label,
      header_cta_href: input.header_cta_href,
      contact_phone: input.contact_phone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "site_id" },
  );

  if (error) {
    throw supabaseReadError("site_global_settings upsert", error.message, error.code);
  }
}
