import "server-only";

import { cache } from "react";
import { fetchSiteLandingSettingsPublic } from "@/lib/db/site-landing-public";
import { getPublishedProjectByIdPublic } from "@/lib/db/projects-public";
import { loadPortfolioProjectBySlug } from "@/lib/services/portfolio-view-data";
import {
  clampHeroIntervalSeconds,
  LANDING_HERO_DEFAULT_INTERVAL_SECONDS,
} from "@/lib/hero-site-interval";
import { clampHomeMoreWorkCount } from "@/lib/home-more-work-settings";
import { ABOUT_STUDIO_IMAGE, HOME_FEATURED_SLUGS, HOME_HERO_IMAGE } from "@/lib/portfolio-data";
import type {
  HomeMoreWorkMode,
  ResolvedHomeContent,
  ResolvedLandingHero,
  SiteHomeFormValues,
  SiteLandingSettingsRow,
} from "@/types/site-landing";

export {
  clampHeroIntervalSeconds,
  LANDING_HERO_DEFAULT_INTERVAL_SECONDS,
  LANDING_HERO_INTERVAL_MAX_SECONDS,
  LANDING_HERO_INTERVAL_MIN_SECONDS,
} from "@/lib/hero-site-interval";

export type { SiteHomeFormValues } from "@/types/site-landing";

export const LANDING_HERO_DEFAULT_TITLE = "Daniel Pintarić";

export const LANDING_HERO_DEFAULT_SUBTITLE =
  "Portrait and editorial work, Berlin — spare daylight, long tonal range, print as the first verdict. Travel when the brief warrants the distance.";

export const LANDING_HERO_DEFAULT_LINK_1 = {
  label: "View work",
  href: "/portfolio",
} as const;

export const LANDING_HERO_DEFAULT_LINK_2 = {
  label: "Get in touch",
  href: "/contact",
} as const;

export const HOME_DEFAULT_SELECTED_WORK_LABEL = "Selected work";
export const HOME_DEFAULT_MORE_WORK_LABEL = "More work";
export const HOME_DEFAULT_APPROACH_KICKER = "Studio";
export const HOME_DEFAULT_APPROACH_TITLE = "Approach";
export const HOME_DEFAULT_APPROACH_BODY =
  "Enough light to read the subject, never enough to stage them. If that pace fits your brief, more context lives on About. Selected commissions and collaborations are arranged through Contact.";

/** Preserves three slots (lead / support / support) for `featured_project_ids` JSON. */
function parseFeaturedProjectIdsTriple(
  raw: unknown,
): [string | null, string | null, string | null] {
  const arr = Array.isArray(raw) ? raw : [];
  const g = (i: number): string | null => {
    const v = arr[i];
    if (typeof v !== "string" || v.trim() === "") {
      return null;
    }
    return v.trim();
  };
  return [g(0), g(1), g(2)];
}

function padManualProjectIdsForForm(raw: unknown): string[] {
  const arr = parseStringArray(raw, 24);
  const out: string[] = [];
  for (let i = 0; i < 12; i++) {
    out.push(arr[i] ?? "");
  }
  return out;
}

function mergeHomeMoreWorkModeFromRow(row: SiteLandingSettingsRow | null): HomeMoreWorkMode {
  return row?.home_more_work_mode === "manual" ? "manual" : "auto";
}

function portfolioDataIsStatic(): boolean {
  return process.env.PORTFOLIO_DATA?.trim().toLowerCase() === "static";
}

function parseStringArray(raw: unknown, maxLen?: number): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") {
      continue;
    }
    const s = x.trim();
    if (s.length === 0) {
      continue;
    }
    out.push(s);
    if (maxLen != null && out.length >= maxLen) {
      break;
    }
  }
  return out;
}

function trimOrNull(s: string | null | undefined): string | null {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : null;
}

function trimOrEmpty(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function parseLinkPair(
  label: string | null | undefined,
  href: string | null | undefined,
): { label: string; href: string } | null {
  const l = trimOrNull(label);
  const h = trimOrNull(href);
  if (!l || !h) {
    return null;
  }
  return { label: l, href: h };
}

function heroIntervalSecondsFromRow(row: SiteLandingSettingsRow | null): number {
  const raw = row?.hero_interval_seconds;
  let n: number;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    n = Math.round(raw);
  } else if (raw != null && String(raw).trim() !== "") {
    const parsed = parseInt(String(raw), 10);
    n = Number.isFinite(parsed) ? parsed : LANDING_HERO_DEFAULT_INTERVAL_SECONDS;
  } else {
    n = LANDING_HERO_DEFAULT_INTERVAL_SECONDS;
  }
  return clampHeroIntervalSeconds(n);
}

function mergeHero(row: SiteLandingSettingsRow | null): ResolvedLandingHero {
  const title = trimOrNull(row?.hero_title) ?? LANDING_HERO_DEFAULT_TITLE;
  const subtitle = trimOrNull(row?.hero_subtitle) ?? LANDING_HERO_DEFAULT_SUBTITLE;
  const urls = parseStringArray(row?.hero_image_urls, 4);
  const heroImageUrls = urls.length > 0 ? urls : [HOME_HERO_IMAGE];
  const heroSlideIntervalMs = heroIntervalSecondsFromRow(row) * 1000;

  const link1 = parseLinkPair(row?.hero_link_1_label, row?.hero_link_1_href) ?? {
    ...LANDING_HERO_DEFAULT_LINK_1,
  };
  const link2 = parseLinkPair(row?.hero_link_2_label, row?.hero_link_2_href) ?? {
    ...LANDING_HERO_DEFAULT_LINK_2,
  };

  return {
    title,
    subtitle,
    heroImageUrls,
    heroSlideIntervalMs,
    link1,
    link2,
  };
}

/**
 * Homepage hero copy + images + links (DB row merged with {@link portfolio-data} defaults).
 */
export async function getResolvedLandingHero(): Promise<ResolvedLandingHero> {
  const row = await fetchSiteLandingSettingsPublic();
  return mergeHero(row);
}

function showSectionFromRow(
  row: SiteLandingSettingsRow | null,
  key: "home_show_selected_work" | "home_show_more_work" | "home_show_approach",
): boolean {
  if (row == null) return true;
  const v = row[key];
  if (v === false) return false;
  return true;
}

function mergeHomeContent(row: SiteLandingSettingsRow | null): ResolvedHomeContent {
  const selectedWorkLabel =
    trimOrNull(row?.home_selected_work_label) ?? HOME_DEFAULT_SELECTED_WORK_LABEL;
  const moreWorkLabel = trimOrNull(row?.home_more_work_label) ?? HOME_DEFAULT_MORE_WORK_LABEL;
  const showSelectedWork = showSectionFromRow(row, "home_show_selected_work");
  const showMoreWork = showSectionFromRow(row, "home_show_more_work");
  const showApproach = showSectionFromRow(row, "home_show_approach");
  const approachKicker = trimOrNull(row?.home_approach_kicker) ?? HOME_DEFAULT_APPROACH_KICKER;
  const approachTitle = trimOrNull(row?.home_approach_title) ?? HOME_DEFAULT_APPROACH_TITLE;
  const approachBody = trimOrNull(row?.home_approach_body) ?? HOME_DEFAULT_APPROACH_BODY;
  const approachImageUrl = trimOrNull(row?.home_approach_image_url) ?? ABOUT_STUDIO_IMAGE;
  const approachCta = parseLinkPair(row?.home_approach_cta_label, row?.home_approach_cta_href);

  return {
    selectedWorkLabel,
    moreWorkLabel,
    showSelectedWork,
    showMoreWork,
    showApproach,
    approachKicker,
    approachTitle,
    approachBody,
    approachImageUrl,
    approachCta,
  };
}

/** Section labels, approach copy, and visibility for `/` (same DB row as hero). */
export const getResolvedHomeContent = cache(async (): Promise<ResolvedHomeContent> => {
  const row = await fetchSiteLandingSettingsPublic();
  return mergeHomeContent(row);
});

const FALLBACK_FEATURED_SLUGS: string[] = [...HOME_FEATURED_SLUGS];

/**
 * Ordered slug list for the featured strip. Uses DB project ids when portfolio is not static
 * and the row defines ids; otherwise falls back to {@link HOME_FEATURED_SLUGS}.
 */
export async function resolveHomeFeaturedProjectSlugs(): Promise<string[]> {
  if (portfolioDataIsStatic()) {
    return [...FALLBACK_FEATURED_SLUGS];
  }

  const row = await fetchSiteLandingSettingsPublic();
  const [lead, s1, s2] = parseFeaturedProjectIdsTriple(row?.featured_project_ids);
  const orderedUniqueIds: string[] = [];
  const seen = new Set<string>();
  for (const id of [lead, s1, s2]) {
    if (!id) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    orderedUniqueIds.push(id);
  }

  if (orderedUniqueIds.length === 0) {
    return [...FALLBACK_FEATURED_SLUGS];
  }

  const slugs: string[] = [];
  for (const id of orderedUniqueIds) {
    try {
      const p = await getPublishedProjectByIdPublic(id);
      if (p) {
        slugs.push(p.slug);
      }
    } catch {
      // skip invalid / transient errors per slot
    }
  }

  if (slugs.length === 0) {
    return [...FALLBACK_FEATURED_SLUGS];
  }

  return padFeaturedSlugsToThree(slugs);
}

async function padFeaturedSlugsToThree(slugs: string[]): Promise<string[]> {
  const out = [...slugs];
  const used = new Set(out);
  for (const fb of FALLBACK_FEATURED_SLUGS) {
    if (out.length >= 3) {
      break;
    }
    if (used.has(fb)) {
      continue;
    }
    try {
      const p = await loadPortfolioProjectBySlug(fb);
      if (p) {
        out.push(fb);
        used.add(fb);
      }
    } catch {
      /* noop */
    }
  }
  return out.slice(0, 3);
}

/** Admin UI: map DB row (or seeded defaults when `row` is null) to form fields. */
export function siteHomeRowToFormValues(row: SiteLandingSettingsRow | null): SiteHomeFormValues {
  const seeded = row == null;
  const urls = parseStringArray(row?.hero_image_urls, 4);
  const defaultImg = HOME_HERO_IMAGE;
  const img1 = urls[0] ?? (seeded || urls.length === 0 ? defaultImg : "");
  const img2 = urls[1] ?? "";
  const img3 = urls[2] ?? "";
  const img4 = urls[3] ?? "";
  const [fid1, fid2, fid3] = parseFeaturedProjectIdsTriple(row?.featured_project_ids);
  const intervalRaw =
    row != null && typeof row.hero_interval_seconds === "number"
      ? row.hero_interval_seconds
      : LANDING_HERO_DEFAULT_INTERVAL_SECONDS;

  return {
    heroTitle: seeded ? LANDING_HERO_DEFAULT_TITLE : (row?.hero_title ?? ""),
    heroSubtitle: seeded ? LANDING_HERO_DEFAULT_SUBTITLE : (row?.hero_subtitle ?? ""),
    heroImage1: img1,
    heroImage2: img2,
    heroImage3: img3,
    heroImage4: img4,
    heroIntervalSeconds: clampHeroIntervalSeconds(intervalRaw),
    heroLink1Label: row?.hero_link_1_label ?? "",
    heroLink1Href: row?.hero_link_1_href ?? "",
    heroLink2Label: row?.hero_link_2_label ?? "",
    heroLink2Href: row?.hero_link_2_href ?? "",
    featuredProjectId1: fid1 ?? "",
    featuredProjectId2: fid2 ?? "",
    featuredProjectId3: fid3 ?? "",
    homeSelectedWorkLabel: seeded
      ? HOME_DEFAULT_SELECTED_WORK_LABEL
      : trimOrEmpty(row?.home_selected_work_label) || HOME_DEFAULT_SELECTED_WORK_LABEL,
    homeMoreWorkLabel: seeded
      ? HOME_DEFAULT_MORE_WORK_LABEL
      : trimOrEmpty(row?.home_more_work_label) || HOME_DEFAULT_MORE_WORK_LABEL,
    homeShowSelectedWork: row == null ? true : row.home_show_selected_work !== false,
    homeShowMoreWork: row == null ? true : row.home_show_more_work !== false,
    homeShowApproach: row == null ? true : row.home_show_approach !== false,
    homeApproachKicker: seeded
      ? HOME_DEFAULT_APPROACH_KICKER
      : trimOrEmpty(row?.home_approach_kicker) || HOME_DEFAULT_APPROACH_KICKER,
    homeApproachTitle: seeded
      ? HOME_DEFAULT_APPROACH_TITLE
      : trimOrEmpty(row?.home_approach_title) || HOME_DEFAULT_APPROACH_TITLE,
    homeApproachBody: seeded
      ? HOME_DEFAULT_APPROACH_BODY
      : trimOrEmpty(row?.home_approach_body) || HOME_DEFAULT_APPROACH_BODY,
    homeApproachImageUrl: seeded ? "" : trimOrEmpty(row?.home_approach_image_url),
    homeApproachCtaLabel: seeded ? "" : trimOrEmpty(row?.home_approach_cta_label ?? ""),
    homeApproachCtaHref: seeded ? "" : trimOrEmpty(row?.home_approach_cta_href ?? ""),
    homeMoreWorkMode: mergeHomeMoreWorkModeFromRow(row),
    homeMoreWorkCount: clampHomeMoreWorkCount(row?.home_more_work_count),
    homeMoreWorkManualProjectIds: padManualProjectIdsForForm(row?.home_more_work_manual_project_ids),
  };
}
