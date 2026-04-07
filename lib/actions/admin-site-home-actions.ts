"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import { upsertSiteLandingSettings } from "@/lib/db/site-landing-admin";
import { upsertSiteGlobalSettings } from "@/lib/db/site-global-admin";
import {
  extractPostgrestCodeFromMessage,
  friendlyAdminSiteDbError,
} from "@/lib/db/supabase-schema-mismatch";
import {
  clampHeroIntervalSeconds,
  LANDING_HERO_DEFAULT_INTERVAL_SECONDS,
} from "@/lib/hero-site-interval";
import { clampHomeMoreWorkCount } from "@/lib/home-more-work-settings";
import { isPlausibleEmailAddress } from "@/lib/email-utils";
import { getPublicConfig } from "@/lib/public-config";
import type { SiteGlobalNavItem } from "@/types/site-global";

export type SiteHomeSaveState = {
  ok?: boolean;
  error?: string;
} | null;

function nullIfEmpty(s: unknown): string | null {
  const t = String(s ?? "").trim();
  return t === "" ? null : t;
}

/** Up to four ordered slots; empties filtered before persist. */
function parseHeroImageSlots(formData: FormData): string[] {
  const keys = ["hero_image_1", "hero_image_2", "hero_image_3", "hero_image_4"] as const;
  const out: string[] = [];
  for (const k of keys) {
    const u = String(formData.get(k) ?? "").trim();
    if (u.length > 0) {
      out.push(u);
    }
  }
  return out;
}

function parseHeroIntervalSecondsField(formData: FormData): number {
  const raw = String(formData.get("hero_interval_seconds") ?? "").trim();
  if (raw === "") {
    return LANDING_HERO_DEFAULT_INTERVAL_SECONDS;
  }
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return LANDING_HERO_DEFAULT_INTERVAL_SECONDS;
  }
  return clampHeroIntervalSeconds(n);
}

function validateLinkPair(
  label: string | null,
  href: string | null,
  name: string,
): string | null {
  if (!label && !href) {
    return null;
  }
  if (!label || !href) {
    return `${name}: enter both label and URL, or leave both empty for defaults.`;
  }
  return null;
}

function validateExtraPair(
  label: string | null,
  url: string | null,
): string | null {
  if (!label && !url) {
    return null;
  }
  if (!label || !url) {
    return `Footer extra link: enter both label and URL, or leave both empty.`;
  }
  return null;
}

function parseNavigationFromForm(
  formData: FormData,
): { ok: true; items: SiteGlobalNavItem[] } | { ok: false; error: string } {
  const items: SiteGlobalNavItem[] = [];
  for (let i = 1; i <= 4; i++) {
    const label = nullIfEmpty(formData.get(`nav_${i}_label`));
    const href = nullIfEmpty(formData.get(`nav_${i}_href`));
    const visible = formData.get(`nav_${i}_visible`) === "1";
    if (!label && !href) {
      continue;
    }
    if (!label || !href) {
      return {
        ok: false,
        error: `Navigation row ${i}: enter both label and href, or leave both empty.`,
      };
    }
    items.push({ label, href, visible });
  }
  if (items.length === 0) {
    return { ok: false, error: "At least one navigation item is required." };
  }
  return { ok: true, items };
}

export async function saveSiteHomeAction(
  _prev: SiteHomeSaveState,
  formData: FormData,
): Promise<SiteHomeSaveState> {
  await requireAdminSession();

  const heroTitle = String(formData.get("hero_title") ?? "").trim();
  const heroSubtitle = String(formData.get("hero_subtitle") ?? "").trim();
  const heroUrls = parseHeroImageSlots(formData);

  const l1Label = nullIfEmpty(formData.get("hero_link_1_label"));
  const l1Href = nullIfEmpty(formData.get("hero_link_1_href"));
  const l2Label = nullIfEmpty(formData.get("hero_link_2_label"));
  const l2Href = nullIfEmpty(formData.get("hero_link_2_href"));

  const err1 = validateLinkPair(l1Label, l1Href, "Link 1");
  if (err1) {
    return { error: err1 };
  }
  const err2 = validateLinkPair(l2Label, l2Href, "Link 2");
  if (err2) {
    return { error: err2 };
  }

  const id1 = nullIfEmpty(formData.get("featured_project_id_1"));
  const id2 = nullIfEmpty(formData.get("featured_project_id_2"));
  const id3 = nullIfEmpty(formData.get("featured_project_id_3"));

  if (id1 && (id1 === id2 || id1 === id3)) {
    return {
      error:
        "Selected work: lead must not be the same project as Support 1 or Support 2.",
    };
  }
  if (id2 && id3 && id2 === id3) {
    return { error: "Selected work: Support 1 and Support 2 must be different projects." };
  }

  const featured_project_ids: (string | null)[] = [id1 ?? null, id2 ?? null, id3 ?? null];
  const hero_interval_seconds = parseHeroIntervalSecondsField(formData);

  const homeMoreWorkModeRaw = String(formData.get("home_more_work_mode") ?? "").trim();
  const home_more_work_mode =
    homeMoreWorkModeRaw === "manual" ? ("manual" as const) : ("auto" as const);
  const home_more_work_count = clampHomeMoreWorkCount(
    parseInt(String(formData.get("home_more_work_count") ?? "6"), 10),
  );

  const manualIdsOrdered: string[] = [];
  const manualSeen = new Set<string>();
  for (let i = 1; i <= 12; i++) {
    const pid = nullIfEmpty(formData.get(`home_more_work_manual_slot_${i}`));
    if (!pid) {
      continue;
    }
    if (manualSeen.has(pid)) {
      continue;
    }
    manualSeen.add(pid);
    manualIdsOrdered.push(pid);
  }
  const home_more_work_manual_project_ids = manualIdsOrdered.slice(0, 12);

  const featuredIdSet = new Set<string>();
  if (id1) {
    featuredIdSet.add(id1);
  }
  if (id2) {
    featuredIdSet.add(id2);
  }
  if (id3) {
    featuredIdSet.add(id3);
  }
  if (home_more_work_mode === "manual" && featuredIdSet.size > 0) {
    for (const pid of home_more_work_manual_project_ids) {
      if (featuredIdSet.has(pid)) {
        return {
          error:
            "More work (manual): a project is also selected under Selected work (lead or support). Remove it from one section or choose another project.",
        };
      }
    }
  }

  const envBrand = getPublicConfig().brandName;
  const globalBrandName = String(formData.get("global_brand_name") ?? "").trim() || envBrand;
  const globalWordmark = nullIfEmpty(formData.get("global_wordmark_text"));
  const globalLogoUrl = nullIfEmpty(formData.get("global_logo_image_url"));
  const globalCopyright = nullIfEmpty(formData.get("global_copyright_holder"));
  const globalFooterTagline = nullIfEmpty(formData.get("global_footer_tagline"));
  const globalFooterEmailTrimmed = String(formData.get("global_footer_email") ?? "").trim();
  if (globalFooterEmailTrimmed.length > 0 && !isPlausibleEmailAddress(globalFooterEmailTrimmed)) {
    return {
      error: "Please enter a valid email address, or leave this field empty.",
    };
  }
  const globalFooterEmailForDb = globalFooterEmailTrimmed;
  const globalIgUrl = nullIfEmpty(formData.get("global_footer_instagram_url"));
  const globalIgLabel = nullIfEmpty(formData.get("global_footer_instagram_label"));
  const globalCtaHref = nullIfEmpty(formData.get("global_footer_cta_href"));
  const globalCtaLabel = nullIfEmpty(formData.get("global_footer_cta_label"));
  const globalExtraUrl = nullIfEmpty(formData.get("global_footer_extra_url"));
  const globalExtraLabel = nullIfEmpty(formData.get("global_footer_extra_label"));
  const globalCity = nullIfEmpty(formData.get("global_location_city"));
  const globalBio = nullIfEmpty(formData.get("global_bio_line"));
  const globalPrimaryLabel = nullIfEmpty(formData.get("global_primary_contact_label"));
  const globalLogoHomeHref = nullIfEmpty(formData.get("global_logo_home_href"));
  const globalHeaderBrandLabel = nullIfEmpty(formData.get("global_header_brand_label"));
  const globalContactPhone = nullIfEmpty(formData.get("global_contact_phone"));
  const globalHeaderCtaLabel = nullIfEmpty(formData.get("global_header_cta_label"));
  const globalHeaderCtaHref = nullIfEmpty(formData.get("global_header_cta_href"));

  const errExtra = validateExtraPair(globalExtraLabel, globalExtraUrl);
  if (errExtra) {
    return { error: errExtra };
  }

  const errHeaderCta = validateLinkPair(globalHeaderCtaLabel, globalHeaderCtaHref, "Header CTA");
  if (errHeaderCta) {
    return { error: errHeaderCta };
  }

  const navParsed = parseNavigationFromForm(formData);
  if (!navParsed.ok) {
    return { error: navParsed.error };
  }

  const homeSelectedWorkLabel = nullIfEmpty(formData.get("home_selected_work_label"));
  const homeMoreWorkLabel = nullIfEmpty(formData.get("home_more_work_label"));
  const homeShowSelectedWork = formData.get("home_show_selected_work") === "1";
  const homeShowMoreWork = formData.get("home_show_more_work") === "1";
  const homeShowApproach = formData.get("home_show_approach") === "1";
  const homeApproachKicker = nullIfEmpty(formData.get("home_approach_kicker"));
  const homeApproachTitle = nullIfEmpty(formData.get("home_approach_title"));
  const homeApproachBodyRaw = String(formData.get("home_approach_body") ?? "").trim();
  const homeApproachBody = homeApproachBodyRaw.length > 0 ? homeApproachBodyRaw : null;
  const homeApproachImageUrl = nullIfEmpty(formData.get("home_approach_image_url"));
  const homeApproachCtaLabel = nullIfEmpty(formData.get("home_approach_cta_label"));
  const homeApproachCtaHref = nullIfEmpty(formData.get("home_approach_cta_href"));

  const errApproachCta = validateLinkPair(homeApproachCtaLabel, homeApproachCtaHref, "Approach CTA");
  if (errApproachCta) {
    return { error: errApproachCta };
  }

  try {
    await upsertSiteLandingSettings({
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_image_urls: heroUrls,
      hero_link_1_label: l1Label,
      hero_link_1_href: l1Href,
      hero_link_2_label: l2Label,
      hero_link_2_href: l2Href,
      featured_project_ids,
      hero_interval_seconds,
      home_selected_work_label: homeSelectedWorkLabel,
      home_more_work_label: homeMoreWorkLabel,
      home_show_selected_work: homeShowSelectedWork,
      home_show_more_work: homeShowMoreWork,
      home_show_approach: homeShowApproach,
      home_approach_kicker: homeApproachKicker,
      home_approach_title: homeApproachTitle,
      home_approach_body: homeApproachBody,
      home_approach_image_url: homeApproachImageUrl,
      home_approach_cta_label: homeApproachCtaLabel,
      home_approach_cta_href: homeApproachCtaHref,
      home_more_work_mode,
      home_more_work_count,
      home_more_work_manual_project_ids,
    });
  } catch (e) {
    const rawMessage = e instanceof Error ? e.message : String(e);
    const codeFromObject =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      typeof (e as { code?: unknown }).code === "string"
        ? (e as { code: string }).code
        : undefined;
    const code = codeFromObject ?? extractPostgrestCodeFromMessage(rawMessage);
    console.error("[admin/site] site_landing_settings upsert failed:", e);
    return { error: friendlyAdminSiteDbError(rawMessage, code) };
  }

  try {
    await upsertSiteGlobalSettings({
      brand_name: globalBrandName,
      wordmark_text: globalWordmark,
      logo_image_url: globalLogoUrl,
      copyright_holder: globalCopyright,
      footer_tagline: globalFooterTagline,
      footer_email: globalFooterEmailForDb,
      footer_instagram_url: globalIgUrl,
      footer_instagram_label: globalIgLabel,
      footer_cta_href: globalCtaHref,
      footer_cta_label: globalCtaLabel,
      footer_extra_url: globalExtraUrl,
      footer_extra_label: globalExtraLabel,
      location_city: globalCity,
      bio_line: globalBio,
      primary_contact_label: globalPrimaryLabel,
      logo_home_href: globalLogoHomeHref,
      header_brand_label: globalHeaderBrandLabel,
      navigation_items: navParsed.items,
      header_cta_label: globalHeaderCtaLabel,
      header_cta_href: globalHeaderCtaHref,
      contact_phone: globalContactPhone,
    });
  } catch (e) {
    const rawMessage = e instanceof Error ? e.message : "Could not save.";
    const codeFromObject =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      typeof (e as { code?: unknown }).code === "string"
        ? (e as { code: string }).code
        : undefined;
    const code = codeFromObject ?? extractPostgrestCodeFromMessage(rawMessage);
    console.error("[admin/site] site_global_settings upsert failed:", e);
    return { error: friendlyAdminSiteDbError(rawMessage, code) };
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/site");
  return { ok: true };
}
