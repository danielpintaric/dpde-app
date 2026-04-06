"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import { upsertSiteLandingSettings } from "@/lib/db/site-landing-admin";
import {
  clampHeroIntervalSeconds,
  LANDING_HERO_DEFAULT_INTERVAL_SECONDS,
} from "@/lib/hero-site-interval";

export type SiteHomeSaveState = {
  ok?: boolean;
  error?: string;
} | null;

function nullIfEmpty(s: unknown): string | null {
  const t = String(s ?? "").trim();
  return t === "" ? null : t;
}

/** Phase 1: three ordered slots; empties filtered before persist. */
function parseHeroImageSlots(formData: FormData): string[] {
  const keys = ["hero_image_1", "hero_image_2", "hero_image_3"] as const;
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
  const featured_project_ids = [id1, id2, id3].filter((x): x is string => x != null);
  const hero_interval_seconds = parseHeroIntervalSecondsField(formData);

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
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save.";
    return { error: message };
  }

  revalidatePath("/");
  revalidatePath("/admin/site");
  return { ok: true };
}
