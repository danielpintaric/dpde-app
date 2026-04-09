/** Decorative loupe for uniform grid / index thumbnails — not interactive. */
export function GalleryHoverLoupe() {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-[240ms] ease-out motion-reduce:transition-none group-hover:opacity-100"
      aria-hidden
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        className="text-zinc-200/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] transition-colors duration-[240ms] ease-out group-hover:text-zinc-100/90"
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
