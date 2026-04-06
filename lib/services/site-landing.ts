import "server-only";

import { fetchSiteLandingSettingsPublic } from "@/lib/db/site-landing-public";
import { getPublishedProjectByIdPublic } from "@/lib/db/projects-public";
import {
  clampHeroIntervalSeconds,
  LANDING_HERO_DEFAULT_INTERVAL_SECONDS,
} from "@/lib/hero-site-interval";
import { HOME_FEATURED_SLUGS, HOME_HERO_IMAGE } from "@/lib/portfolio-data";
import type {
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
  const urls = parseStringArray(row?.hero_image_urls);
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
  const ids = parseStringArray(row?.featured_project_ids, 3);
  if (ids.length === 0) {
    return [...FALLBACK_FEATURED_SLUGS];
  }

  const slugs: string[] = [];
  for (const id of ids) {
    try {
      const p = await getPublishedProjectByIdPublic(id);
      if (p) {
        slugs.push(p.slug);
      }
    } catch {
      // skip invalid / transient errors per slot
    }
  }

  if (slugs.length > 0) {
    return slugs;
  }

  return [...FALLBACK_FEATURED_SLUGS];
}

/** Admin UI: map DB row (or seeded defaults when `row` is null) to form fields. */
export function siteHomeRowToFormValues(row: SiteLandingSettingsRow | null): SiteHomeFormValues {
  const seeded = row == null;
  const urls = parseStringArray(row?.hero_image_urls);
  const defaultImg = HOME_HERO_IMAGE;
  const img1 = urls[0] ?? (seeded || urls.length === 0 ? defaultImg : "");
  const img2 = urls[1] ?? "";
  const img3 = urls[2] ?? "";
  const ids = parseStringArray(row?.featured_project_ids, 3);
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
    heroIntervalSeconds: clampHeroIntervalSeconds(intervalRaw),
    heroLink1Label: row?.hero_link_1_label ?? "",
    heroLink1Href: row?.hero_link_1_href ?? "",
    heroLink2Label: row?.hero_link_2_label ?? "",
    heroLink2Href: row?.hero_link_2_href ?? "",
    featuredProjectId1: ids[0] ?? "",
    featuredProjectId2: ids[1] ?? "",
    featuredProjectId3: ids[2] ?? "",
  };
}
