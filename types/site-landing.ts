/**
 * Public site settings for the homepage (Phase 1).
 * Maps to `public.site_landing_settings` (single row `id = default`).
 */

export type SiteLandingSettingsRow = {
  id: string;
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
  updated_at: string;
};

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

/** `/admin/site` form shape (from `site_landing_settings` + defaults). */
export type SiteHomeFormValues = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage1: string;
  heroImage2: string;
  heroImage3: string;
  heroIntervalSeconds: number;
  heroLink1Label: string;
  heroLink1Href: string;
  heroLink2Label: string;
  heroLink2Href: string;
  featuredProjectId1: string;
  featuredProjectId2: string;
  featuredProjectId3: string;
};
