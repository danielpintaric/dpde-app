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

/** Gallery trigger wrapper — kept for API compatibility; no transform (GPU stability). */
export const transitionImageHover = "";

/** Calm ease shared by lightbox + grid thumbnails (no flashy motion) */
export const galleryMotionEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Scrollbar visually hidden while overflow scroll stays active (mouse, trackpad, touch, `scrollIntoView`).
 * Firefox: `scrollbar-width`; WebKit: `::-webkit-scrollbar`; legacy Edge: `-ms-overflow-style`.
 */
export const scrollbarHiddenHorizontal =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:[display:none]";

/** Uniform grid / index tiles — border only (no scale transforms). */
export const galleryTileShell =
  "rounded-xl border bg-zinc-900 transition-[border-color,box-shadow] duration-[220ms] " +
  `${galleryMotionEase} hover:border-zinc-700/85`;

/** Darkening overlay on grid thumbnails — smooth fade */
export const galleryTileMediaOverlay =
  "pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-[240ms] ease-out group-hover:bg-black/[0.07]";

/** Public portfolio grid — softer hover wash than client / selection tiles */
export const galleryTileMediaOverlayPublic =
  "pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-[320ms] ease-out group-hover:bg-black/[0.035]";

/** Wide public feature tiles — even quieter wash (editorial, not “tool”) */
export const galleryTileMediaOverlayPublicSoft =
  "pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-[380ms] ease-out group-hover:bg-black/[0.022]";

/**
 * Support-column trio — light veil at rest; hover eases it for a touch more clarity (still behind the hero).
 */
export const galleryTileMediaOverlayPublicSupport =
  "pointer-events-none absolute inset-0 bg-zinc-950/[0.026] transition-colors duration-[230ms] ease-out group-hover:bg-zinc-950/[0.007]";

/** Public portfolio tile shell — no hover scale (compositor stability). */
export const galleryTileShellPublic =
  "rounded-xl border bg-zinc-900 transition-[border-color,box-shadow] duration-[260ms] " +
  `${galleryMotionEase} hover:border-zinc-700/72`;

/**
 * Public editorial **support column** (vertical trio): border motion only.
 */
export const galleryTileShellPublicSupport =
  "rounded-xl border bg-zinc-900 transition-[border-color,box-shadow] duration-[240ms] " +
  `${galleryMotionEase} hover:border-zinc-700/52`;

/** Header / shell morphs — calm fade band */
export const transitionShell =
  "transition-[background-color,border-color] duration-[300ms] ease-out";

/** Inline & nav links — keyboard focus without loud box */
export const linkFocusVisible =
  "rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

/** Subtle tap feedback (links, text buttons) */
export const tapSoft = "active:opacity-[0.9]";

/** Default editorial tone — no CSS filter utilities (GPU stability). */
export const defaultImageToneClasses = "";

/** Editorial layout: no inner image scale on hover. */
export const editorialImageMotion = "";

/** Linkable / hoverable image blocks */
export const editorialImage =
  `object-cover ${defaultImageToneClasses} ${editorialImageMotion}`.trim();

/** Uniform grid cards: cover, no inner zoom (scale lives on the card wrapper). */
export const galleryGridImageBase = "h-full w-full object-cover";

export const galleryGridImage = `${galleryGridImageBase} ${defaultImageToneClasses}`.trim();

/** Hero or static leads — same tone, no hover */
export const editorialImageTone = `object-cover ${defaultImageToneClasses}`.trim();

/** Work / client index: project thumbnail as a calm gallery tile */
export const portfolioIndexThumbShell =
  "relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900 transition-[border-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-zinc-700/85";
export const portfolioIndexThumbAspect = "relative aspect-[4/5] w-full";

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
export const homeTileImageBase = `object-cover ${defaultImageToneClasses}`.trim();

/** Home landing — no transform hover (GPU stability). */
export const homeTileImageHover = "";

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
