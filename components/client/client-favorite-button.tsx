"use client";

import { linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";

export function ClientFavoriteStarIcon({
  filled,
  className = "",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.35}
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M12 3.5l2.47 5.01 5.53.8-4 3.9.94 5.5L12 16.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L12 3.5z"
        strokeLinecap="round"
      />
    </svg>
  );
}

const tileShell =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full " +
  "border border-zinc-500/35 bg-zinc-950/90 text-amber-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.35)] " +
  "transition-[color,background-color,border-color,opacity,box-shadow] duration-200 " +
  "hover:border-amber-200/35 hover:bg-zinc-950/72 hover:text-amber-100 " +
  "opacity-[0.78] group-hover:opacity-100 motion-reduce:transition-none";

const tileShellSelected =
  "border-amber-200/45 bg-zinc-950/75 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_2px_14px_rgba(0,0,0,0.4)] " +
  "opacity-100";

const lbShell =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full " +
  "border border-zinc-600/28 bg-zinc-950/90 text-amber-200/88 " +
  "transition-[color,background-color,border-color] duration-200 " +
  "hover:border-zinc-500/40 hover:bg-zinc-900/55 hover:text-amber-100 " +
  "opacity-90 hover:opacity-100 motion-reduce:transition-none";

const lbShellSelected =
  "border-amber-200/40 bg-zinc-950/65 text-amber-50 opacity-100 shadow-[0_0_0_1px_rgba(251,191,36,0.1)]";

type TileProps = {
  filled: boolean;
  onToggle: () => void;
  label: string;
};

/** Favorite control on gallery tiles — stops propagation so the tile still opens the lightbox. */
export function ClientFavoriteTileButton({ filled, onToggle, label }: TileProps) {
  return (
    <button
      type="button"
      aria-pressed={filled}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`pointer-events-auto absolute right-2 top-2 z-[4] ${tileShell} ${filled ? tileShellSelected : ""} ${linkFocusVisible} ${tapSoft} ${transitionQuick}`}
    >
      <ClientFavoriteStarIcon filled={filled} className="h-[1.15rem] w-[1.15rem]" />
    </button>
  );
}

type LightboxProps = {
  filled: boolean;
  onToggle: () => void;
  label: string;
};

export function ClientFavoriteLightboxButton({ filled, onToggle, label }: LightboxProps) {
  return (
    <button
      type="button"
      aria-pressed={filled}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`absolute left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] z-30 ${lbShell} ${filled ? lbShellSelected : ""} ${linkFocusVisible} ${tapSoft} ${transitionQuick}`}
    >
      <ClientFavoriteStarIcon filled={filled} className="h-[1.15rem] w-[1.15rem]" />
    </button>
  );
}
