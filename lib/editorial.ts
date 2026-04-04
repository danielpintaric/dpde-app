/**
 * Editorial UI tokens — single source for typography, image treatment, and focus.
 * Tailwind class strings only (no runtime logic).
 */

export const focusRing =
  "outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

/** Linkable / hoverable image blocks */
export const editorialImage =
  "object-cover brightness-[0.97] contrast-[1.02] transition duration-300 ease-out group-hover:scale-[1.015] group-hover:opacity-[0.94]";

/** Hero or static leads — same tone, no hover */
export const editorialImageTone =
  "object-cover brightness-[0.97] contrast-[1.02]";

export const editorialImageOverlay =
  "pointer-events-none absolute inset-0 bg-zinc-950/[0.07]";

export const editorialFrame = `group relative block overflow-hidden bg-zinc-900 ${focusRing}`;

export const typeMeta =
  "text-[10px] font-medium uppercase tracking-[0.32em] text-zinc-500";

export const typeH1Hero =
  "font-serif text-[clamp(2.5rem,5.5vw,3.75rem)] font-normal leading-[1.02] tracking-[-0.035em] text-zinc-100";

export const typeH1Page =
  "font-serif text-[clamp(2rem,4.25vw,3.25rem)] font-normal leading-[1.06] tracking-[-0.035em] text-zinc-100";

export const typeH2Section =
  "font-serif text-2xl font-normal tracking-[-0.03em] text-zinc-100 sm:text-[1.75rem]";

export const typeH2Large =
  "font-serif text-3xl font-normal tracking-[-0.03em] text-zinc-100 sm:text-[2.125rem]";

export const typeH2Contact =
  "font-serif text-xl font-normal tracking-[-0.02em] text-zinc-100 sm:text-2xl";

export const typeBody =
  "text-sm font-light leading-[1.75] tracking-[0.01em] text-zinc-400 sm:text-[0.9375rem]";

export const typeBodyMuted =
  "text-sm font-light leading-[1.75] text-zinc-500 sm:text-[0.9375rem]";

/** Below-frame captions — serif, always under media */
export const typeCaption =
  "mt-4 max-w-md font-serif text-[13px] font-normal leading-relaxed tracking-[-0.01em] text-zinc-400 sm:mt-5";

/** Vertical rhythm: meta → title → body */
export const stackMetaToTitle = "mt-4";
export const stackTitleToBody = "mt-6";

/** Section vertical padding */
export const sectionNormal = "py-20";
export const sectionMajor = "py-28";
