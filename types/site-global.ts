/**
 * Global site identity + footer (maps to `public.site_global_settings`, single row `id = default`).
 */

import type { SiteHomeFormValues } from "@/types/site-landing";

/** Stored in `navigation_items` JSONB and used by the public header. */
export type SiteGlobalNavItem = {
  label: string;
  href: string;
  /** Default true when omitted. */
  visible?: boolean;
};

export type SiteGlobalSettingsRow = {
  id: string;
  brand_name: string;
  wordmark_text: string | null;
  logo_image_url: string | null;
  copyright_holder: string | null;
  footer_tagline: string | null;
  footer_email: string | null;
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
  navigation_items: unknown;
  header_cta_label: string | null;
  header_cta_href: string | null;
  contact_phone: string | null;
  updated_at: string;
};

/** Normalized nav item for rendering (visible entries only in `navigationItems`). */
export type ResolvedNavItem = {
  label: string;
  href: string;
  visible: boolean;
};

/** Merged site identity + footer for public layout (serializable). */
export type ResolvedSiteGlobal = {
  brandName: string;
  wordmarkText: string;
  logoImageUrl: string | null;
  /** Logo link `href` (default `/`). */
  logoHomeHref: string;
  /** Optional; reserved for future header UI — may be empty. */
  headerBrandLabel: string | null;
  copyrightHolder: string;
  footerTagline: string;
  footerEmail: string;
  footerEmailMailto: string;
  footerEmailLinkLabel: string;
  instagramUrl: string | null;
  instagramLabel: string;
  footerCtaHref: string;
  footerCtaLabel: string;
  footerExtraUrl: string | null;
  footerExtraLabel: string | null;
  locationCity: string | null;
  bioLine: string | null;
  primaryContactLabel: string | null;
  /** Primary phone (digits / +); optional `tel:` in UI. */
  contactPhone: string | null;
  /** Visible nav items only (for header). */
  navigationItems: ResolvedNavItem[];
  /** Optional extra link in header (e.g. mailto or /contact). */
  headerCtaLabel: string | null;
  headerCtaHref: string | null;
};

/** `/admin/site` — Brand & footer fields (merged with defaults when row missing). */
export type SiteGlobalFormValues = {
  brandName: string;
  wordmarkText: string;
  logoImageUrl: string;
  copyrightHolder: string;
  footerTagline: string;
  footerEmail: string;
  footerInstagramUrl: string;
  footerInstagramLabel: string;
  footerCtaHref: string;
  footerCtaLabel: string;
  footerExtraUrl: string;
  footerExtraLabel: string;
  locationCity: string;
  bioLine: string;
  primaryContactLabel: string;
  logoHomeHref: string;
  headerBrandLabel: string;
  contactPhone: string;
  headerCtaLabel: string;
  headerCtaHref: string;
  nav1Label: string;
  nav1Href: string;
  nav1Visible: boolean;
  nav2Label: string;
  nav2Href: string;
  nav2Visible: boolean;
  nav3Label: string;
  nav3Href: string;
  nav3Visible: boolean;
  nav4Label: string;
  nav4Href: string;
  nav4Visible: boolean;
};

/** `/admin/site` — combined hero + featured + brand/footer form. */
export type AdminSiteFormValues = SiteHomeFormValues & SiteGlobalFormValues;
