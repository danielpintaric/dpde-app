/**
 * Editorial UI tokens — single source for typography, image treatment, and focus.
 * Tailwind class strings only (no runtime logic).
 */

export const focusRing =
  "outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

/** Short UI / inline links (inputs, CTAs, chrome) */
export const transitionQuick = "transition duration-[170ms] ease-out";

/** Text color shifts (group-hover labels, meta lines) */
export const transitionColorsQuick = "transition-colors duration-[170ms] ease-out";

/**
 * Primary navigation — editorial, soft (color/underline ease, no snap).
 * Slightly longer ease-out step reads calmer than generic `transition`.
 */
export const transitionNav =
  "transition-[color,opacity,text-decoration-color,text-underline-offset] duration-[175ms] ease-out";

/** Gallery trigger wrapper — transform timing in sync with `editorialImage` (no extra hover layers) */
export const transitionImageHover =
  "transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Header / shell morphs — calm fade band */
export const transitionShell =
  "transition-[background-color,backdrop-filter,border-color] duration-[300ms] ease-out";

/** Inline & nav links — keyboard focus without loud box */
export const linkFocusVisible =
  "rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

/** Subtle tap feedback (links, text buttons) */
export const tapSoft = "active:opacity-[0.9]";

/** Linkable / hoverable image blocks — transform-only hover, soft attack, gradual ease */
export const editorialImage =
  "object-cover brightness-[0.97] contrast-[1.02] transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]";

/** Hero or static leads — same tone, no hover */
export const editorialImageTone =
  "object-cover brightness-[0.97] contrast-[1.02]";

export const editorialImageOverlay =
  "pointer-events-none absolute inset-0 bg-zinc-950/[0.07]";

export const editorialFrame = `group relative block overflow-hidden bg-zinc-900 ${focusRing}`;

/** Same as `editorialFrame` but signals pointer affordance on desktop */
export const editorialFrameInteractive = `${editorialFrame} cursor-pointer`;

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

/** Home landing: „Selected work“ / „More work“ — eine Kicker-Linie. */
export const homeSectionKicker =
  "font-serif text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500/75 sm:text-[11px] sm:tracking-[0.16em]";

/** Approach-Block: gleiche Kicker-Typo wie Selected/More, ohne Caps („Studio“). */
export const homeApproachKicker = `${homeSectionKicker} normal-case`;

/** Home tile images: gemeinsame Basis (Hover separat). */
export const homeTileImageBase =
  "object-cover brightness-[0.97] contrast-[1.02]";

/**
 * Home landing — nur Zoom (kein Hover-Filter); 800 ms, Kurve wie zuletzt als „genau richtig“.
 * Voller String — Tailwind JIT muss den kompletten String sehen.
 */
export const homeTileImageHover =
  "transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.014]";

/** Abstand Bildunterkante → Caption-Stack. */
export const homeTileCaptionStack = "mt-3 sm:mt-4";

/** Abstand Kategorie-Zeile → Titel (More Work, wenn Meta gesetzt). */
export const homeTileMetaToTitle = "mt-1";

/** Kategorie-Zeile unter Kacheln (More Work). */
export const homeTileMeta =
  "text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500/85 transition-colors duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-zinc-500";

/** Titel unter Kacheln (Support + More Work). */
export const homeTileTitle =
  "font-serif text-[0.9375rem] font-normal leading-snug tracking-[-0.02em] text-zinc-400/95 transition-colors duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-zinc-200 sm:text-base";

/** Vertical rhythm: meta → title → body */
export const stackMetaToTitle = "mt-4";
export const stackTitleToBody = "mt-6";

/** Section vertical padding */
export const sectionNormal = "py-20";
export const sectionMajor = "py-28";

/**
 * Standard inner page: aligns with header/footer gutters and lands calmly before the footer.
 * Use for About, Work, Contact, Client (project detail uses the same pt/pb on `<article>`).
 */
export const pageContentShell =
  "px-6 pb-24 pt-28 sm:px-10 sm:pb-28 sm:pt-28 lg:px-16 lg:pb-32 lg:pt-28";
