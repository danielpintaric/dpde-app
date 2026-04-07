import "server-only";

import { cache } from "react";
import { fetchSiteGlobalSettingsPublic } from "@/lib/db/site-global-public";
import { getPublicConfig } from "@/lib/public-config";
import { isPlausibleEmailAddress, sanitizeEmailForMailto } from "@/lib/email-utils";
import { DEFAULT_SITE_ID } from "@/lib/site-defaults";
import type {
  ResolvedNavItem,
  ResolvedSiteGlobal,
  SiteGlobalFormValues,
  SiteGlobalSettingsRow,
} from "@/types/site-global";

/** Code defaults — match previous hardcoded site chrome when DB/env are empty. */
export const SITE_GLOBAL_DEFAULT_FOOTER_TAGLINE =
  "Portrait and editorial — Berlin. Selected commissions by arrangement.";

export const SITE_GLOBAL_DEFAULT_FOOTER_EMAIL = "hello@danielpintaric.com";
export const SITE_GLOBAL_DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/";
export const SITE_GLOBAL_DEFAULT_INSTAGRAM_LABEL = "Instagram";
export const SITE_GLOBAL_DEFAULT_CTA_HREF = "/contact";
export const SITE_GLOBAL_DEFAULT_CTA_LABEL = "Get in touch";

/** Default main navigation (matches previous `site-header` NAV). */
export const SITE_GLOBAL_DEFAULT_NAV: ResolvedNavItem[] = [
  { label: "Work", href: "/portfolio", visible: true },
  { label: "About", href: "/about", visible: true },
  { label: "Contact", href: "/contact", visible: true },
  { label: "Client area", href: "/client", visible: true },
];

const NAV_SLOT_COUNT = 4;

function trimOrNull(s: string | null | undefined): string | null {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : null;
}

function trimOrEmpty(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function parseNavigationJson(raw: unknown, hasRow: boolean): ResolvedNavItem[] {
  if (!hasRow) {
    return SITE_GLOBAL_DEFAULT_NAV.map((x) => ({ ...x }));
  }
  if (!Array.isArray(raw)) {
    return SITE_GLOBAL_DEFAULT_NAV.map((x) => ({ ...x }));
  }
  const out: ResolvedNavItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label.trim() : "";
    const href = typeof o.href === "string" ? o.href.trim() : "";
    if (!label || !href) continue;
    const visible = o.visible === false ? false : true;
    out.push({ label, href, visible });
  }
  return out.length > 0 ? out : SITE_GLOBAL_DEFAULT_NAV.map((x) => ({ ...x }));
}

function visibleNavItems(items: ResolvedNavItem[]): ResolvedNavItem[] {
  return items.filter((i) => i.visible);
}

function mergeRow(row: SiteGlobalSettingsRow | null): ResolvedSiteGlobal {
  const envBrand = getPublicConfig().brandName;
  const hasRow = row != null;

  const brandName = trimOrEmpty(row?.brand_name) || envBrand;
  const wordmarkText = trimOrNull(row?.wordmark_text) ?? brandName;
  const copyrightHolder = trimOrNull(row?.copyright_holder) ?? brandName;
  const footerTagline = trimOrNull(row?.footer_tagline) ?? SITE_GLOBAL_DEFAULT_FOOTER_TAGLINE;

  let footerEmailRaw: string;
  if (!hasRow) {
    footerEmailRaw = SITE_GLOBAL_DEFAULT_FOOTER_EMAIL;
  } else if (row?.footer_email === null || row?.footer_email === undefined) {
    footerEmailRaw = SITE_GLOBAL_DEFAULT_FOOTER_EMAIL;
  } else {
    footerEmailRaw = String(row.footer_email).trim();
  }

  const hasValidContactEmail =
    footerEmailRaw.length > 0 && isPlausibleEmailAddress(footerEmailRaw);
  const footerEmailSanitized = hasValidContactEmail
    ? sanitizeEmailForMailto(footerEmailRaw)
    : "";
  const footerEmail = footerEmailSanitized;
  const footerEmailMailto =
    hasValidContactEmail && footerEmailSanitized.length > 0
      ? `mailto:${footerEmailSanitized}`
      : "";

  const instagramUrl = hasRow
    ? trimOrNull(row?.footer_instagram_url)
    : SITE_GLOBAL_DEFAULT_INSTAGRAM_URL;
  const instagramLabel =
    trimOrNull(row?.footer_instagram_label) ?? SITE_GLOBAL_DEFAULT_INSTAGRAM_LABEL;
  const footerCtaHref = trimOrNull(row?.footer_cta_href) ?? SITE_GLOBAL_DEFAULT_CTA_HREF;
  const footerCtaLabel = trimOrNull(row?.footer_cta_label) ?? SITE_GLOBAL_DEFAULT_CTA_LABEL;
  const footerExtraUrl = trimOrNull(row?.footer_extra_url);
  const footerExtraLabel = trimOrNull(row?.footer_extra_label);
  const logoImageUrl = trimOrNull(row?.logo_image_url);
  const locationCity = trimOrNull(row?.location_city);
  const bioLine = trimOrNull(row?.bio_line);
  const primaryContactLabel = trimOrNull(row?.primary_contact_label);
  const contactPhone = trimOrNull(row?.contact_phone);

  const logoHomeHref = trimOrNull(row?.logo_home_href) ?? "/";
  const headerBrandLabel = trimOrNull(row?.header_brand_label);
  const navAll = parseNavigationJson(row?.navigation_items, hasRow);
  const headerCtaLabel = trimOrNull(row?.header_cta_label);
  const headerCtaHref = trimOrNull(row?.header_cta_href);

  const footerEmailLinkLabel =
    primaryContactLabel ?? (hasValidContactEmail ? footerEmail : "");

  return {
    brandName,
    wordmarkText,
    logoImageUrl,
    logoHomeHref,
    headerBrandLabel,
    copyrightHolder,
    footerTagline,
    footerEmail,
    footerEmailMailto,
    footerEmailLinkLabel,
    hasValidContactEmail,
    instagramUrl,
    instagramLabel,
    footerCtaHref,
    footerCtaLabel,
    footerExtraUrl,
    footerExtraLabel,
    locationCity,
    bioLine,
    primaryContactLabel,
    contactPhone,
    navigationItems: visibleNavItems(navAll),
    headerCtaLabel,
    headerCtaHref,
  };
}

/**
 * Cached per request — use in layout, metadata, and public shell.
 */
export const getResolvedSiteGlobal = cache(
  async (siteId: string = DEFAULT_SITE_ID): Promise<ResolvedSiteGlobal> => {
    const row = await fetchSiteGlobalSettingsPublic(siteId);
    return mergeRow(row);
  },
);

function navToFormSlots(items: ResolvedNavItem[]): {
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
} {
  const pad = [...items];
  while (pad.length < NAV_SLOT_COUNT) {
    pad.push({ label: "", href: "", visible: true });
  }
  const s = pad.slice(0, NAV_SLOT_COUNT);
  return {
    nav1Label: s[0]?.label ?? "",
    nav1Href: s[0]?.href ?? "",
    nav1Visible: s[0]?.visible !== false,
    nav2Label: s[1]?.label ?? "",
    nav2Href: s[1]?.href ?? "",
    nav2Visible: s[1]?.visible !== false,
    nav3Label: s[2]?.label ?? "",
    nav3Href: s[2]?.href ?? "",
    nav3Visible: s[2]?.visible !== false,
    nav4Label: s[3]?.label ?? "",
    nav4Href: s[3]?.href ?? "",
    nav4Visible: s[3]?.visible !== false,
  };
}

/** Admin form: DB row + defaults when null or first install. */
export function siteGlobalRowToFormValues(row: SiteGlobalSettingsRow | null): SiteGlobalFormValues {
  const envBrand = getPublicConfig().brandName;
  const seeded = row == null;
  const hasRow = row != null;

  const navResolved = parseNavigationJson(row?.navigation_items, hasRow);
  const navSlots = navToFormSlots(navResolved);

  return {
    brandName: seeded ? envBrand : trimOrEmpty(row.brand_name) || envBrand,
    wordmarkText: seeded ? "" : trimOrEmpty(row.wordmark_text),
    logoImageUrl: seeded ? "" : trimOrEmpty(row.logo_image_url),
    copyrightHolder: seeded ? "" : trimOrEmpty(row.copyright_holder),
    footerTagline: seeded ? SITE_GLOBAL_DEFAULT_FOOTER_TAGLINE : trimOrEmpty(row.footer_tagline),
    footerEmail:
      seeded || row?.footer_email === null || row?.footer_email === undefined
        ? SITE_GLOBAL_DEFAULT_FOOTER_EMAIL
        : String(row.footer_email).trim(),
    footerInstagramUrl: seeded ? SITE_GLOBAL_DEFAULT_INSTAGRAM_URL : trimOrEmpty(row.footer_instagram_url),
    footerInstagramLabel: seeded ? SITE_GLOBAL_DEFAULT_INSTAGRAM_LABEL : trimOrEmpty(row.footer_instagram_label),
    footerCtaHref: seeded ? SITE_GLOBAL_DEFAULT_CTA_HREF : trimOrEmpty(row.footer_cta_href),
    footerCtaLabel: seeded ? SITE_GLOBAL_DEFAULT_CTA_LABEL : trimOrEmpty(row.footer_cta_label),
    footerExtraUrl: seeded ? "" : trimOrEmpty(row.footer_extra_url),
    footerExtraLabel: seeded ? "" : trimOrEmpty(row.footer_extra_label),
    locationCity: seeded ? "" : trimOrEmpty(row.location_city),
    bioLine: seeded ? "" : trimOrEmpty(row.bio_line),
    primaryContactLabel: seeded ? "" : trimOrEmpty(row.primary_contact_label),
    logoHomeHref: seeded ? "/" : trimOrEmpty(row.logo_home_href) || "/",
    headerBrandLabel: seeded ? "" : trimOrEmpty(row.header_brand_label),
    contactPhone: seeded ? "" : trimOrEmpty(row.contact_phone),
    headerCtaLabel: seeded ? "" : trimOrEmpty(row.header_cta_label),
    headerCtaHref: seeded ? "" : trimOrEmpty(row.header_cta_href),
    ...navSlots,
  };
}
