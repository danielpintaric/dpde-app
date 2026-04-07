/**
 * Public site settings for the homepage (Phase 1).
 * Maps to `public.site_landing_settings` (single row `id = default`).
 * DB columns must cover `upsertSiteLandingSettings` in `lib/db/site-landing-admin.ts`
 * (see `supabase/migrations/20260413120000_site_landing_settings_upsert_full_sync.sql`).
 */

export type SiteLandingSettingsRow = {
  id: string;
  /** Tenant id; FK to `sites.id`. Single row per site. */
  site_id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_urls: unknown;
  hero_link_1_label: string | null;
  hero_link_1_href: string | null;
  hero_link_2_label: string | null;
  hero_link_2_href: string | null;
  featured_project_ids: unknown;
  /** Seconds between hero slides (multi-image). App default 8; clamp 4–20 when saving. */
  hero_interval_seconds: number | null;
  home_selected_work_label: string | null;
  home_more_work_label: string | null;
  home_show_selected_work: boolean | null;
  home_show_more_work: boolean | null;
  home_show_approach: boolean | null;
  home_approach_kicker: string | null;
  home_approach_title: string | null;
  home_approach_body: string | null;
  home_approach_image_url: string | null;
  home_approach_cta_label: string | null;
  home_approach_cta_href: string | null;
  /** `auto` = newest excluding selected work; `manual` = ordered IDs in `home_more_work_manual_project_ids`. */
  home_more_work_mode?: string | null;
  /** Tile count for More work (6, 9, or 12). */
  home_more_work_count?: number | null;
  /** Ordered project ids for manual More work. */
  home_more_work_manual_project_ids?: unknown;
  updated_at: string;
};

export type HomeMoreWorkMode = "auto" | "manual";

export type LandingHeroLink = {
  label: string;
  href: string;
};

/** Values merged from DB + code defaults; drives `/` hero block. */
export type ResolvedLandingHero = {
  title: string;
  subtitle: string;
  heroImageUrls: string[];
  /** Time between hero image transitions (ms), for multi-image slideshow only. */
  heroSlideIntervalMs: number;
  link1: LandingHeroLink;
  link2: LandingHeroLink;
};

/** Merged home section copy + visibility (from `site_landing_settings`). */
export type ResolvedHomeContent = {
  selectedWorkLabel: string;
  moreWorkLabel: string;
  showSelectedWork: boolean;
  showMoreWork: boolean;
  showApproach: boolean;
  approachKicker: string;
  approachTitle: string;
  approachBody: string;
  approachImageUrl: string;
  approachCta: LandingHeroLink | null;
};

/** `/admin/site` form shape (from `site_landing_settings` + defaults). */
export type SiteHomeFormValues = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage1: string;
  heroImage2: string;
  heroImage3: string;
  heroImage4: string;
  heroIntervalSeconds: number;
  heroLink1Label: string;
  heroLink1Href: string;
  heroLink2Label: string;
  heroLink2Href: string;
  featuredProjectId1: string;
  featuredProjectId2: string;
  featuredProjectId3: string;
  homeSelectedWorkLabel: string;
  homeMoreWorkLabel: string;
  homeShowSelectedWork: boolean;
  homeShowMoreWork: boolean;
  homeShowApproach: boolean;
  homeApproachKicker: string;
  homeApproachTitle: string;
  homeApproachBody: string;
  homeApproachImageUrl: string;
  homeApproachCtaLabel: string;
  homeApproachCtaHref: string;
  homeMoreWorkMode: HomeMoreWorkMode;
  homeMoreWorkCount: number;
  /** Up to 12 slots for manual ordering (UI may show fewer based on count). */
  homeMoreWorkManualProjectIds: string[];
};
