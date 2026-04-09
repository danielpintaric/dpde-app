"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import type { Image } from "@/types/project";

type Props = {
  image: Image;
  /** Called after focal changes so the parent form can re-check dirty state. */
  onFocalChange?: () => void;
  compact?: boolean;
};

const labelClass = "mb-1 block text-[10px] uppercase tracking-wider text-zinc-600";
const labelClassCompact = "mb-0.5 block text-[9px] uppercase tracking-[0.08em] text-zinc-500";

export function FocalPointPicker({ image, onFocalChange, compact = false }: Props) {
  const cLabel = compact ? labelClassCompact : labelClass;
  const previewUrl = getAdminImagePreviewUrl(image);

  const [focalX, setFocalX] = useState<number | null>(() =>
    typeof image.focalX === "number" && typeof image.focalY === "number"
      ? image.focalX
      : null,
  );
  const [focalY, setFocalY] = useState<number | null>(() =>
    typeof image.focalX === "number" && typeof image.focalY === "number"
      ? image.focalY
      : null,
  );

  useEffect(() => {
    const set =
      typeof image.focalX === "number" && typeof image.focalY === "number";
    setFocalX(set ? image.focalX : null);
    setFocalY(set ? image.focalY : null);
  }, [image.id, image.focalX, image.focalY]);

  const displayX = focalX ?? 50;
  const displayY = focalY ?? 50;

  const notify = useCallback(() => {
    queueMicrotask(() => onFocalChange?.());
  }, [onFocalChange]);

  const onPick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setFocalX(Math.max(0, Math.min(100, x)));
      setFocalY(Math.max(0, Math.min(100, y)));
      notify();
    },
    [notify],
  );

  const onClear = useCallback(() => {
    setFocalX(null);
    setFocalY(null);
    notify();
  }, [notify]);

  return (
    <div className={compact ? "col-span-2 min-w-0" : "sm:col-span-2"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label className={cLabel}>Focal point</label>
        {focalX !== null ? (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-[10px] text-zinc-500 underline decoration-zinc-700/50 underline-offset-2 hover:text-zinc-400"
          >
            Clear (use legacy position)
          </button>
        ) : null}
      </div>
      <p className="mb-1.5 text-[10px] leading-snug text-zinc-500">
        Click preview to set the crop anchor (0–100). Empty = center or legacy CSS below.
      </p>
      <button
        type="button"
        onClick={onPick}
        aria-label="Focal point: click image to set crop anchor"
        className={`relative mx-auto block w-full max-w-[min(100%,220px)] cursor-crosshair overflow-hidden rounded-md border border-zinc-700 bg-zinc-950 p-0 ${
          compact ? "aspect-[4/5]" : "aspect-[4/5] sm:max-w-[240px]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; external URLs */}
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: `${displayX}% ${displayY}%` }}
          draggable={false}
        />
        <span
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/95 bg-white/35 shadow-md ring-1 ring-black/40"
          style={{ left: `${displayX}%`, top: `${displayY}%` }}
          aria-hidden
        />
      </button>
      <input type="hidden" name="focalX" value={focalX === null ? "" : String(focalX)} />
      <input type="hidden" name="focalY" value={focalY === null ? "" : String(focalY)} />
    </div>
  );
}
