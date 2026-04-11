/**
 * Mobile admin layout — Tailwind class literals (JIT must see full strings).
 *
 * Sync with `components/admin/admin-app-header-client.tsx` mobile row:
 * `min-h-[3.75rem]` + `py-4` → use **3.75rem** as header height in calc() below.
 *
 * Pill strip height for scroll-margin: header offset + inner pt-3 + nav row + border
 * (see sticky wrapper `pt-3` + `SiteSettingsMobileNav`).
 */

/** Sticky Site Settings pill wrapper — `max-lg` only. Inner `pt-3` clears pills from the header edge. */
export const adminSiteSettingsStickyPillClass =
  "sticky top-[calc(env(safe-area-inset-top,0px)+3.75rem)] z-40 col-span-full -mx-4 border-b border-zinc-800/80 bg-zinc-950/90 pt-3 sm:-mx-6 lg:hidden";

/** `AdminSection` scroll-margin: mobile = safe + header + pill strip (incl. pt-3) + gap; lg+ unchanged. */
export const adminSectionScrollMarginClass =
  "max-lg:scroll-mt-[calc(env(safe-area-inset-top,0px)+3.75rem+4.5rem+0.5rem)] lg:scroll-mt-[calc(env(safe-area-inset-top,0px)+4rem+0.5rem)]";
