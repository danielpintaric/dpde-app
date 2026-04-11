export type GalleryLoupeTone = "default" | "soft" | "support";

const toneClass: Record<GalleryLoupeTone, string> = {
  default:
    "opacity-0 transition-opacity duration-[240ms] ease-out motion-reduce:transition-none group-hover:opacity-100",
  soft:
    "opacity-0 transition-opacity duration-[380ms] ease-out motion-reduce:transition-none group-hover:opacity-[0.72]",
  support:
    "opacity-0 transition-opacity duration-[230ms] ease-out motion-reduce:transition-none group-hover:opacity-[0.56]",
};

const iconToneClass: Record<GalleryLoupeTone, string> = {
  default:
    "text-zinc-200/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] transition-colors duration-[240ms] ease-out group-hover:text-zinc-100/90",
  soft:
    "text-zinc-300/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.28)] transition-colors duration-[380ms] ease-out group-hover:text-zinc-200/78",
  support:
    "text-zinc-400/62 drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)] transition-colors duration-[230ms] ease-out group-hover:text-zinc-300/68",
};

type Props = {
  /** `soft` = more restrained (public editorial feature tiles). */
  tone?: GalleryLoupeTone;
};

/** Decorative loupe for uniform grid / index thumbnails — not interactive. */
export function GalleryHoverLoupe({ tone = "default" }: Props) {
  return (
    <span
      className={
        "pointer-events-none absolute inset-0 z-[2] flex items-center justify-center " +
        toneClass[tone]
      }
      aria-hidden
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        className={iconToneClass[tone]}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16 L20 20" />
      </svg>
    </span>
  );
}
