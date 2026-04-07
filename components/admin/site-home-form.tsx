"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { saveSiteHomeAction, type SiteHomeSaveState } from "@/lib/actions/admin-site-home-actions";
import { editorSaveButtonPrimaryClass } from "@/components/admin/editor-save-button-styles";
import { serializeFormSnapshot } from "@/lib/admin/site-home-form-snapshot";
import { SiteHeroImageSlots } from "@/components/admin/site-hero-image-slots";
import {
  LANDING_HERO_INTERVAL_MAX_SECONDS,
  LANDING_HERO_INTERVAL_MIN_SECONDS,
} from "@/lib/hero-site-interval";
import { HOME_MORE_WORK_COUNT_OPTIONS } from "@/lib/home-more-work-settings";
import type { SiteHomeFormValues } from "@/types/site-landing";
import type { AdminSiteFormValues } from "@/types/site-global";
import type { Project } from "@/types/project";

const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500";
const fieldClass =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none";
const sectionTitle =
  "mb-1 border-b border-zinc-800/80 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500";
const sectionIntro = "mb-5 max-w-prose text-[12px] leading-relaxed text-zinc-500";
const panelClass =
  "rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-5 shadow-md shadow-black/15 ring-1 ring-zinc-800/35 sm:p-6";
/** Offset for anchor scroll so section titles clear the sticky admin header (h-14 / sm:h-16) + safe area. */
const sectionScrollClass =
  "scroll-mt-[calc(env(safe-area-inset-top,0px)+3.5rem+0.5rem)] sm:scroll-mt-[calc(env(safe-area-inset-top,0px)+4rem+0.5rem)]";
const sectionPanelClass = `${panelClass} ${sectionScrollClass}`;
const formMainClass =
  "mx-auto flex w-full max-w-5xl flex-col space-y-10 px-4 pb-32 sm:px-6 lg:space-y-12";

type ProjectOption = Pick<Project, "id" | "title" | "slug">;

const siteAdminNavLinkClass =
  "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium outline-none transition-colors hover:bg-white/5 hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const siteAdminNavLinkInactiveClass = `${siteAdminNavLinkClass} border-b border-transparent text-zinc-500`;
const siteAdminNavLinkActiveClass = `${siteAdminNavLinkClass} border-b border-zinc-500/45 text-zinc-200`;

/** Section ids for `/admin/site` jump nav + scroll-spy (order = document order). */
const ADMIN_SITE_NAV_SECTION_IDS: readonly string[] = [
  "admin-site-brand",
  "admin-site-navigation",
  "admin-site-header-cta",
  "admin-site-contact",
  "admin-site-footer",
  "admin-site-hero",
  "admin-site-homepage",
  "admin-site-home-curation",
];

function pickAdminSiteActiveSectionId(navEl: HTMLElement | null): string {
  const lineY =
    navEl != null
      ? navEl.getBoundingClientRect().bottom + 4
      : typeof window !== "undefined"
        ? Math.min(168, window.innerHeight * 0.22)
        : 140;

  const lastId = ADMIN_SITE_NAV_SECTION_IDS[ADMIN_SITE_NAV_SECTION_IDS.length - 1]!;
  const lastSection = document.getElementById(lastId);
  if (
    lastSection &&
    typeof window !== "undefined" &&
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  ) {
    return lastId;
  }

  let active = ADMIN_SITE_NAV_SECTION_IDS[0]!;
  for (const id of ADMIN_SITE_NAV_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) {
      continue;
    }
    const top = el.getBoundingClientRect().top;
    if (top <= lineY + 1) {
      active = id;
    }
  }
  return active;
}

/** In-page jump links for the long `/admin/site` form (anchors on sections below). */
function SiteAdminInPageNav() {
  const navRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(ADMIN_SITE_NAV_SECTION_IDS[0] ?? null);

  const items = useMemo(
    () =>
      [
        { href: "#admin-site-brand", label: "Brand" },
        { href: "#admin-site-navigation", label: "Navigation" },
        { href: "#admin-site-header-cta", label: "Header CTA" },
        { href: "#admin-site-contact", label: "Contact" },
        { href: "#admin-site-footer", label: "Footer" },
        { href: "#admin-site-hero", label: "Hero" },
        { href: "#admin-site-homepage", label: "Homepage content" },
        { href: "#admin-site-home-curation", label: "Home curation" },
      ] as const,
    [],
  );

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const next = pickAdminSiteActiveSectionId(navRef.current);
      setActiveId((prev) => (prev === next ? prev : next));
    });
  }, []);

  useLayoutEffect(() => {
    scheduleUpdate();
    let inner: number | null = null;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(scheduleUpdate);
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner != null) {
        cancelAnimationFrame(inner);
      }
    };
  }, [scheduleUpdate]);

  useEffect(() => {
    const thresholds = [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1];
    const observer = new IntersectionObserver(scheduleUpdate, {
      root: null,
      rootMargin: "-96px 0px -52% 0px",
      threshold: thresholds,
    });

    for (const id of ADMIN_SITE_NAV_SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleUpdate]);

  return (
    <nav
      ref={navRef}
      className="sticky top-14 z-30 -mx-4 mb-6 border-b border-zinc-800/50 bg-zinc-950/90 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:top-16 sm:mb-8 sm:px-6"
      aria-label="Sections on this page"
    >
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">
        Jump to
      </p>
      <div className="flex flex-wrap gap-x-2 gap-y-1.5">
        {items.map(({ href, label }) => {
          const id = href.slice(1);
          const isActive = activeId === id;
          return (
            <a
              key={href}
              href={href}
              className={isActive ? siteAdminNavLinkActiveClass : siteAdminNavLinkInactiveClass}
              aria-current={isActive ? "location" : undefined}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function SiteHomeSelectedWorkFields({
  lead,
  support1,
  support2,
  onLeadChange,
  onSupport1Change,
  onSupport2Change,
  projects,
}: {
  lead: string;
  support1: string;
  support2: string;
  onLeadChange: (v: string) => void;
  onSupport1Change: (v: string) => void;
  onSupport2Change: (v: string) => void;
  projects: ProjectOption[];
}) {
  const sorted = projects.slice().sort((a, b) => a.title.localeCompare(b.title));

  const slots = [
    {
      id: "featured_project_id_1" as const,
      label: "Lead project",
      value: lead,
      onChange: onLeadChange,
    },
    {
      id: "featured_project_id_2" as const,
      label: "Support 1",
      value: support1,
      onChange: onSupport1Change,
    },
    {
      id: "featured_project_id_3" as const,
      label: "Support 2",
      value: support2,
      onChange: onSupport2Change,
    },
  ];

  return (
    <div>
      <span className={`${labelClass} mb-3 block`}>Selected work</span>
      <p className="mb-4 text-[12px] leading-relaxed text-zinc-500">
        Lead plus two support tiles define the &ldquo;Selected work&rdquo; block. Empty slots are filled
        automatically on the public site. Applies when the portfolio is served from Supabase and{" "}
        <span className="font-mono text-zinc-400">PORTFOLIO_DATA</span> is not{" "}
        <span className="font-mono text-zinc-400">static</span>.
      </p>
      <div className="flex flex-col gap-4">
        {slots.map(({ id, label, value, onChange }) => (
          <div key={id}>
            <label htmlFor={id} className={labelClass}>
              {label}
            </label>
            <select
              id={id}
              name={id}
              className={fieldClass}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={sorted.length === 0}
            >
              <option value="">— None —</option>
              {sorted.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteHomeMoreWorkFields({
  initial,
  projects,
  excludedProjectIds,
}: {
  initial: AdminSiteFormValues;
  projects: ProjectOption[];
  /** Project IDs used in Selected work — hidden from manual More work picks to avoid duplicates. */
  excludedProjectIds: string[];
}) {
  const sorted = projects.slice().sort((a, b) => a.title.localeCompare(b.title));
  const excluded = new Set(excludedProjectIds);
  /** Keep current slot value visible even if it became excluded (e.g. user moved project to Selected work). */
  const manualOptionsForSlot = (slotValue: string) => {
    const v = slotValue.trim();
    return sorted.filter((p) => !excluded.has(p.id) || p.id === v);
  };

  const [mode, setMode] = useState(initial.homeMoreWorkMode);
  const [count, setCount] = useState(initial.homeMoreWorkCount);
  const [manualSlots, setManualSlots] = useState<string[]>(() => [
    ...initial.homeMoreWorkManualProjectIds,
  ]);

  useEffect(() => {
    setMode(initial.homeMoreWorkMode);
    setCount(initial.homeMoreWorkCount);
    setManualSlots([...initial.homeMoreWorkManualProjectIds]);
  }, [
    initial.homeMoreWorkMode,
    initial.homeMoreWorkCount,
    initial.homeMoreWorkManualProjectIds.join("\u0000"),
  ]);

  return (
    <div className="border-t border-zinc-800/70 pt-4">
      <span className={`${labelClass} mb-3 block`}>More work</span>
      <p className="mb-4 text-[12px] leading-relaxed text-zinc-500">
        <strong className="font-medium text-zinc-400">Automatic</strong> shows the newest public projects
        (by creation date), excluding Selected work. <strong className="font-medium text-zinc-400">Manual</strong>{" "}
        uses the ordered list below; projects already in Selected work are not listed. Empty slots are filled
        automatically on the public site if needed.
      </p>

      <div className="flex flex-col gap-4">
        <fieldset className="min-w-0">
          <legend className={labelClass}>Mode</legend>
          <div className="mt-2 flex flex-col gap-2 text-[12px] text-zinc-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="home_more_work_mode"
                value="auto"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
                className="border-zinc-600"
              />
              Automatic (newest, excluding Selected work)
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="home_more_work_mode"
                value="manual"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
                className="border-zinc-600"
              />
              Manual (ordered list)
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="home_more_work_count" className={labelClass}>
            Number of tiles
          </label>
          <select
            id="home_more_work_count"
            name="home_more_work_count"
            className={fieldClass}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {HOME_MORE_WORK_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {mode === "manual" ? (
          <div className="flex flex-col gap-3">
            <span className={labelClass}>Manual order (position 1 = first tile)</span>
            {Array.from({ length: count }, (_, slotIndex) => {
              const i = slotIndex;
              const name = `home_more_work_manual_slot_${i + 1}` as const;
              const value = manualSlots[i] ?? "";
              const rowOptions = manualOptionsForSlot(value);
              return (
                <div key={name}>
                  <label htmlFor={name} className="mb-1 block text-[11px] text-zinc-600">
                    Slot {i + 1}
                  </label>
                  <select
                    id={name}
                    name={name}
                    className={fieldClass}
                    value={value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setManualSlots((prev) => {
                        const next = [...prev];
                        while (next.length < 12) {
                          next.push("");
                        }
                        next[i] = v;
                        return next;
                      });
                    }}
                    disabled={sorted.length === 0}
                  >
                    <option value="">— None —</option>
                    {rowOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NavRow({
  slot,
  initial,
}: {
  slot: 1 | 2 | 3 | 4;
  initial: AdminSiteFormValues;
}) {
  const label =
    slot === 1
      ? initial.nav1Label
      : slot === 2
        ? initial.nav2Label
        : slot === 3
          ? initial.nav3Label
          : initial.nav4Label;
  const href =
    slot === 1
      ? initial.nav1Href
      : slot === 2
        ? initial.nav2Href
        : slot === 3
          ? initial.nav3Href
          : initial.nav4Href;
  const visible =
    slot === 1
      ? initial.nav1Visible
      : slot === 2
        ? initial.nav2Visible
        : slot === 3
          ? initial.nav3Visible
          : initial.nav4Visible;
  return (
    <div className="grid gap-3 rounded-lg border border-zinc-800/60 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor={`nav_${slot}_label`} className={labelClass}>
          Label
        </label>
        <input
          id={`nav_${slot}_label`}
          name={`nav_${slot}_label`}
          className={fieldClass}
          defaultValue={label}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor={`nav_${slot}_href`} className={labelClass}>
          URL / path
        </label>
        <input
          id={`nav_${slot}_href`}
          name={`nav_${slot}_href`}
          className={fieldClass}
          defaultValue={href}
          placeholder="/portfolio"
          autoComplete="off"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 pb-2 text-[12px] text-zinc-400">
        <input
          type="checkbox"
          name={`nav_${slot}_visible`}
          value="1"
          defaultChecked={visible}
          className="rounded border-zinc-600"
        />
        Visible
      </label>
    </div>
  );
}

function SiteGlobalSettingsSections({ initial }: { initial: AdminSiteFormValues }) {
  return (
    <>
      <section
        id="admin-site-brand"
        className={sectionPanelClass}
        aria-labelledby="site-brand-heading"
      >
        <h2 id="site-brand-heading" className={sectionTitle}>
          Brand
        </h2>
        <p className={sectionIntro}>Public name, wordmark, logo, and copyright.</p>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_brand_name" className={labelClass}>
                Brand name
              </label>
              <input
                id="global_brand_name"
                name="global_brand_name"
                className={fieldClass}
                defaultValue={initial.brandName}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_wordmark_text" className={labelClass}>
                Wordmark (header text, optional)
              </label>
              <input
                id="global_wordmark_text"
                name="global_wordmark_text"
                className={fieldClass}
                defaultValue={initial.wordmarkText}
                placeholder="Leave empty to use brand name"
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label htmlFor="global_logo_image_url" className={labelClass}>
              Logo image URL (optional)
            </label>
            <input
              id="global_logo_image_url"
              name="global_logo_image_url"
              className={fieldClass}
              defaultValue={initial.logoImageUrl}
              placeholder="https://…"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_logo_home_href" className={labelClass}>
                Logo link target
              </label>
              <input
                id="global_logo_home_href"
                name="global_logo_home_href"
                className={fieldClass}
                defaultValue={initial.logoHomeHref}
                placeholder="/"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_header_brand_label" className={labelClass}>
                Short brand label (optional, reserved)
              </label>
              <input
                id="global_header_brand_label"
                name="global_header_brand_label"
                className={fieldClass}
                defaultValue={initial.headerBrandLabel}
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label htmlFor="global_copyright_holder" className={labelClass}>
              Copyright name (optional)
            </label>
            <input
              id="global_copyright_holder"
              name="global_copyright_holder"
              className={fieldClass}
              defaultValue={initial.copyrightHolder}
              placeholder="Leave empty to use brand name"
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      <section
        id="admin-site-navigation"
        className={sectionPanelClass}
        aria-labelledby="site-nav-heading"
      >
        <h2 id="site-nav-heading" className={sectionTitle}>
          Navigation
        </h2>
        <p className={sectionIntro}>
          Manage header links and visibility. At least one row with label and URL is required.
        </p>
        <div className="flex flex-col gap-3">
          <NavRow slot={1} initial={initial} />
          <NavRow slot={2} initial={initial} />
          <NavRow slot={3} initial={initial} />
          <NavRow slot={4} initial={initial} />
        </div>
      </section>

      <section
        id="admin-site-header-cta"
        className={sectionPanelClass}
        aria-labelledby="site-header-cta-heading"
      >
        <h2 id="site-header-cta-heading" className={sectionTitle}>
          Header CTA (optional)
        </h2>
        <p className={sectionIntro}>Optional extra link beside the main navigation.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="global_header_cta_label" className={labelClass}>
              Label
            </label>
            <input
              id="global_header_cta_label"
              name="global_header_cta_label"
              className={fieldClass}
              defaultValue={initial.headerCtaLabel}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="global_header_cta_href" className={labelClass}>
              URL / path
            </label>
            <input
              id="global_header_cta_href"
              name="global_header_cta_href"
              className={fieldClass}
              defaultValue={initial.headerCtaHref}
              placeholder="/contact"
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      <section
        id="admin-site-contact"
        className={sectionPanelClass}
        aria-labelledby="site-contact-heading"
      >
        <h2 id="site-contact-heading" className={sectionTitle}>
          Contact
        </h2>
        <p className={sectionIntro}>Email, phone, Instagram, and location shown on the site.</p>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_footer_email" className={labelClass}>
                Primary email
              </label>
              <input
                id="global_footer_email"
                name="global_footer_email"
                type="email"
                className={fieldClass}
                defaultValue={initial.footerEmail}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_contact_phone" className={labelClass}>
                Phone (optional)
              </label>
              <input
                id="global_contact_phone"
                name="global_contact_phone"
                className={fieldClass}
                defaultValue={initial.contactPhone}
                placeholder="+49 …"
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label htmlFor="global_primary_contact_label" className={labelClass}>
              Email link label (optional)
            </label>
            <input
              id="global_primary_contact_label"
              name="global_primary_contact_label"
              className={fieldClass}
              defaultValue={initial.primaryContactLabel}
              placeholder="Defaults to email address"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_footer_instagram_url" className={labelClass}>
                Instagram URL
              </label>
              <input
                id="global_footer_instagram_url"
                name="global_footer_instagram_url"
                className={fieldClass}
                defaultValue={initial.footerInstagramUrl}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_footer_instagram_label" className={labelClass}>
                Instagram label
              </label>
              <input
                id="global_footer_instagram_label"
                name="global_footer_instagram_label"
                className={fieldClass}
                defaultValue={initial.footerInstagramLabel}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_location_city" className={labelClass}>
                Location / city (optional)
              </label>
              <input
                id="global_location_city"
                name="global_location_city"
                className={fieldClass}
                defaultValue={initial.locationCity}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_bio_line" className={labelClass}>
                Short bio line (optional, metadata)
              </label>
              <input
                id="global_bio_line"
                name="global_bio_line"
                className={fieldClass}
                defaultValue={initial.bioLine}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="admin-site-footer"
        className={sectionPanelClass}
        aria-labelledby="site-footer-heading"
      >
        <h2 id="site-footer-heading" className={sectionTitle}>
          Footer
        </h2>
        <p className={sectionIntro}>Tagline, primary CTA, and secondary links in the footer.</p>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="global_footer_tagline" className={labelClass}>
              Footer description
            </label>
            <textarea
              id="global_footer_tagline"
              name="global_footer_tagline"
              rows={3}
              className={`${fieldClass} resize-y`}
              defaultValue={initial.footerTagline}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_footer_cta_href" className={labelClass}>
                Footer CTA link
              </label>
              <input
                id="global_footer_cta_href"
                name="global_footer_cta_href"
                className={fieldClass}
                defaultValue={initial.footerCtaHref}
                placeholder="/contact"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_footer_cta_label" className={labelClass}>
                Footer CTA label
              </label>
              <input
                id="global_footer_cta_label"
                name="global_footer_cta_label"
                className={fieldClass}
                defaultValue={initial.footerCtaLabel}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="global_footer_extra_url" className={labelClass}>
                Secondary link URL (optional)
              </label>
              <input
                id="global_footer_extra_url"
                name="global_footer_extra_url"
                className={fieldClass}
                defaultValue={initial.footerExtraUrl}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="global_footer_extra_label" className={labelClass}>
                Secondary link label
              </label>
              <input
                id="global_footer_extra_label"
                name="global_footer_extra_label"
                className={fieldClass}
                defaultValue={initial.footerExtraLabel}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SiteHomeHeroSection({
  initial,
  onHeroUrlsChange,
}: {
  initial: SiteHomeFormValues;
  onHeroUrlsChange?: () => void;
}) {
  return (
    <section
      id="admin-site-hero"
      className={sectionPanelClass}
      aria-labelledby="site-home-hero-heading"
    >
      <h2 id="site-home-hero-heading" className={sectionTitle}>
        Hero
      </h2>
      <p className={sectionIntro}>
        Homepage headline, slideshow, and links. Empty title or subtitle falls back to defaults; leave all
        image slots empty to use the built-in hero image after save.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="hero_title" className={labelClass}>
            Hero title
          </label>
          <input
            id="hero_title"
            name="hero_title"
            className={fieldClass}
            defaultValue={initial.heroTitle}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="hero_subtitle" className={labelClass}>
            Hero subtitle
          </label>
          <textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={4}
            className={`${fieldClass} resize-y`}
            defaultValue={initial.heroSubtitle}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className={labelClass}>Hero images</span>
          <p className="text-[11px] leading-relaxed text-zinc-600">
            Up to four images (first = initial slide). Uploaded files go to{" "}
            <span className="font-mono text-zinc-500">site/hero/slot-*</span> in the project storage bucket —
            isolated from portfolio folders. Empty slots are ignored when saving.
          </p>
          <SiteHeroImageSlots
            key={`${initial.heroImage1}\u0001${initial.heroImage2}\u0001${initial.heroImage3}\u0001${initial.heroImage4}`}
            initial1={initial.heroImage1}
            initial2={initial.heroImage2}
            initial3={initial.heroImage3}
            initial4={initial.heroImage4}
            onUrlsChange={onHeroUrlsChange}
          />
        </div>

        <div>
          <label htmlFor="hero_interval_seconds" className={labelClass}>
            Hero interval
          </label>
          <input
            id="hero_interval_seconds"
            name="hero_interval_seconds"
            type="number"
            min={LANDING_HERO_INTERVAL_MIN_SECONDS}
            max={LANDING_HERO_INTERVAL_MAX_SECONDS}
            step={1}
            className={fieldClass}
            defaultValue={initial.heroIntervalSeconds}
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
            Time between hero image transitions in seconds.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hero_link_1_label" className={labelClass}>
              Link 1 label
            </label>
            <input
              id="hero_link_1_label"
              name="hero_link_1_label"
              className={fieldClass}
              defaultValue={initial.heroLink1Label}
            />
          </div>
          <div>
            <label htmlFor="hero_link_1_href" className={labelClass}>
              Link 1 href
            </label>
            <input
              id="hero_link_1_href"
              name="hero_link_1_href"
              className={fieldClass}
              defaultValue={initial.heroLink1Href}
            />
          </div>
          <div>
            <label htmlFor="hero_link_2_label" className={labelClass}>
              Link 2 label
            </label>
            <input
              id="hero_link_2_label"
              name="hero_link_2_label"
              className={fieldClass}
              defaultValue={initial.heroLink2Label}
            />
          </div>
          <div>
            <label htmlFor="hero_link_2_href" className={labelClass}>
              Link 2 href
            </label>
            <input
              id="hero_link_2_href"
              name="hero_link_2_href"
              className={fieldClass}
              defaultValue={initial.heroLink2Href}
            />
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-600">
          For each link, set both label and href — or leave both empty to use the default pair on the
          public site.
        </p>
      </div>
    </section>
  );
}

function SiteHomepageContentSection({
  initial,
  projects,
}: {
  initial: AdminSiteFormValues;
  projects: ProjectOption[];
}) {
  const [lead, setLead] = useState(initial.featuredProjectId1);
  const [support1, setSupport1] = useState(initial.featuredProjectId2);
  const [support2, setSupport2] = useState(initial.featuredProjectId3);

  useEffect(() => {
    setLead(initial.featuredProjectId1);
    setSupport1(initial.featuredProjectId2);
    setSupport2(initial.featuredProjectId3);
  }, [initial.featuredProjectId1, initial.featuredProjectId2, initial.featuredProjectId3]);

  const excludedForMoreWork = [lead, support1, support2]
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section
      id="admin-site-homepage"
      className={sectionPanelClass}
      aria-labelledby="site-homepage-content-heading"
    >
      <h2 id="site-homepage-content-heading" className={sectionTitle}>
        Homepage content
      </h2>
      <p className={sectionIntro}>
        Section labels, approach content, and visibility. Curate Selected work and More work in the block
        below. Hero copy lives in the Hero section above.
      </p>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="home_selected_work_label" className={labelClass}>
              Selected work — section label
            </label>
            <input
              id="home_selected_work_label"
              name="home_selected_work_label"
              className={fieldClass}
              defaultValue={initial.homeSelectedWorkLabel}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="home_more_work_label" className={labelClass}>
              More work — section label
            </label>
            <input
              id="home_more_work_label"
              name="home_more_work_label"
              className={fieldClass}
              defaultValue={initial.homeMoreWorkLabel}
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Section visibility</span>
          <div className="mt-2 flex flex-col gap-2 text-[12px] text-zinc-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="home_show_selected_work"
                value="1"
                defaultChecked={initial.homeShowSelectedWork}
                className="rounded border-zinc-600"
              />
              Show Selected work
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="home_show_more_work"
                value="1"
                defaultChecked={initial.homeShowMoreWork}
                className="rounded border-zinc-600"
              />
              Show More work
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="home_show_approach"
                value="1"
                defaultChecked={initial.homeShowApproach}
                className="rounded border-zinc-600"
              />
              Show Approach
            </label>
          </div>
        </div>

        <div
          id="admin-site-home-curation"
          className={`border-t border-zinc-800/70 pt-4 ${sectionScrollClass}`}
        >
          <h3 className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Home project curation
          </h3>
          <p className="mb-5 max-w-prose text-[12px] leading-relaxed text-zinc-500">
            Choose which projects appear in Selected work and how More work is filled (automatic or manual
            list). Saving uses the same controls as the rest of this page.
          </p>
          <div className="flex flex-col gap-6">
            <SiteHomeSelectedWorkFields
              lead={lead}
              support1={support1}
              support2={support2}
              onLeadChange={setLead}
              onSupport1Change={setSupport1}
              onSupport2Change={setSupport2}
              projects={projects}
            />
            <SiteHomeMoreWorkFields
              initial={initial}
              projects={projects}
              excludedProjectIds={excludedForMoreWork}
            />
          </div>
        </div>

        <div className="border-t border-zinc-800/70 pt-4">
          <span className={`${labelClass} mb-3 block`}>Approach block</span>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="home_approach_kicker" className={labelClass}>
                  Kicker (small line above title)
                </label>
                <input
                  id="home_approach_kicker"
                  name="home_approach_kicker"
                  className={fieldClass}
                  defaultValue={initial.homeApproachKicker}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="home_approach_title" className={labelClass}>
                  Title
                </label>
                <input
                  id="home_approach_title"
                  name="home_approach_title"
                  className={fieldClass}
                  defaultValue={initial.homeApproachTitle}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="home_approach_body" className={labelClass}>
                Text (line breaks preserved)
              </label>
              <textarea
                id="home_approach_body"
                name="home_approach_body"
                rows={6}
                className={`${fieldClass} resize-y`}
                defaultValue={initial.homeApproachBody}
              />
            </div>
            <div>
              <label htmlFor="home_approach_image_url" className={labelClass}>
                Image URL (optional — empty uses default)
              </label>
              <input
                id="home_approach_image_url"
                name="home_approach_image_url"
                className={fieldClass}
                defaultValue={initial.homeApproachImageUrl}
                placeholder="https://…"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="home_approach_cta_label" className={labelClass}>
                  Optional CTA label
                </label>
                <input
                  id="home_approach_cta_label"
                  name="home_approach_cta_label"
                  className={fieldClass}
                  defaultValue={initial.homeApproachCtaLabel}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="home_approach_cta_href" className={labelClass}>
                  Optional CTA URL / path
                </label>
                <input
                  id="home_approach_cta_href"
                  name="home_approach_cta_href"
                  className={fieldClass}
                  defaultValue={initial.homeApproachCtaHref}
                  placeholder="/about"
                  autoComplete="off"
                />
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Set both CTA label and URL, or leave both empty to hide the Approach CTA on the public site.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type Props = {
  initial: AdminSiteFormValues;
  projects: ProjectOption[];
};

export function SiteHomeForm({ initial, projects }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const baselineRef = useRef<string>("");

  const [state, formAction, pending] = useActionState(
    saveSiteHomeAction,
    null as SiteHomeSaveState,
  );

  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const checkDirty = useCallback(() => {
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) {
        return;
      }
      const snap = serializeFormSnapshot(form);
      const isDirty = snap !== baselineRef.current;
      setDirty(isDirty);
      if (isDirty) {
        setSavedFlash(false);
      }
    });
  }, []);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) {
        return;
      }
      baselineRef.current = serializeFormSnapshot(form);
      setDirty(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }
    const raf = requestAnimationFrame(() => {
      if (!formRef.current) {
        return;
      }
      baselineRef.current = serializeFormSnapshot(formRef.current);
      setDirty(false);
      setSavedFlash(true);
      void router.refresh();
    });
    const t = window.setTimeout(() => setSavedFlash(false), 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [state, router]);

  const saveDisabled = pending || !dirty;
  let saveLabel: string;
  if (pending) {
    saveLabel = "Saving...";
  } else if (savedFlash && !dirty) {
    saveLabel = "Saved";
  } else if (!dirty) {
    saveLabel = "No changes";
  } else {
    saveLabel = "Save changes";
  }

  const saveButtonClass = `${editorSaveButtonPrimaryClass} w-full justify-center px-6 py-2.5 text-sm sm:min-w-[12rem] sm:justify-center ${
    saveDisabled && !pending ? "opacity-60" : ""
  }`;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="relative min-w-0"
      onInput={checkDirty}
      onChange={checkDirty}
    >
      <div className={formMainClass}>
        {state?.error ? (
          <p
            className="rounded-lg border border-red-900/50 bg-red-950/25 px-3 py-2 text-sm text-red-200/95"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        <SiteAdminInPageNav />

        <SiteGlobalSettingsSections initial={initial} />
        <SiteHomeHeroSection initial={initial} onHeroUrlsChange={checkDirty} />
        <SiteHomepageContentSection initial={initial} projects={projects} />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="pointer-events-auto w-full max-w-5xl border-t border-zinc-800/90 bg-zinc-950/95 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/80 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p
              className={`min-h-[1.25rem] text-[12px] ${savedFlash && !dirty ? "text-emerald-400/90" : "text-transparent"}`}
              aria-live="polite"
            >
              {savedFlash && !dirty ? "Settings saved." : "\u00a0"}
            </p>
            <button
              type="submit"
              className={saveButtonClass}
              disabled={saveDisabled}
              aria-busy={pending}
            >
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
