"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { updateImageFocalMutation } from "@/lib/actions/admin-image-actions";
import { getAdminImagePreviewUrl } from "@/lib/admin/admin-image-preview-url";
import { isArrowNavBlockedForBatch } from "@/lib/admin/batch-edit-keyboard";
import { focusRing, linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";
import type { Image, Project } from "@/types/project";

type Props = {
  project: Project;
  image: Image | null;
  open: boolean;
  onClose: () => void;
  onSaved: (imageId: string, focalX: number | null, focalY: number | null) => void;
  /** 1-based; omit or total≤1 to hide batch chrome */
  batchIndex?: number;
  batchTotal?: number;
  batchCanGoPrev?: boolean;
  batchCanGoNext?: boolean;
  onBatchNavigatePrev?: () => void;
  onBatchNavigateNext?: () => void;
};

function focalDirty(image: Image, focalX: number | null, focalY: number | null): boolean {
  const hasState = focalX !== null && focalY !== null;
  const hasSaved = typeof image.focalX === "number" && typeof image.focalY === "number";
  if (!hasState && !hasSaved) {
    return false;
  }
  if (hasState !== hasSaved) {
    return true;
  }
  if (!hasState) {
    return false;
  }
  return focalX !== image.focalX || focalY !== image.focalY;
}

export function FocalPointModal({
  project,
  image,
  open,
  onClose,
  onSaved,
  batchIndex = 1,
  batchTotal = 1,
  batchCanGoPrev = false,
  batchCanGoNext = false,
  onBatchNavigatePrev,
  onBatchNavigateNext,
}: Props) {
  const [focalX, setFocalX] = useState<number | null>(null);
  const [focalY, setFocalY] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const persistLockRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image || !open) return;
    const has = typeof image.focalX === "number" && typeof image.focalY === "number";
    setFocalX(has ? image.focalX : null);
    setFocalY(has ? image.focalY : null);
    setError(null);
  }, [image, open, image?.id, image?.focalX, image?.focalY]);

  const dirty = useMemo(() => (image ? focalDirty(image, focalX, focalY) : false), [image, focalX, focalY]);

  const displayX = focalX ?? 50;
  const displayY = focalY ?? 50;
  const previewUrl = image ? getAdminImagePreviewUrl(image) : "";

  const onPick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocalX(Math.max(0, Math.min(100, x)));
    setFocalY(Math.max(0, Math.min(100, y)));
  }, []);

  const onReset = useCallback(() => {
    setFocalX(null);
    setFocalY(null);
  }, []);

  const persistFocal = useCallback(
    async (closeAfter: boolean): Promise<boolean> => {
      if (!image || persistLockRef.current) {
        return false;
      }
      persistLockRef.current = true;
      setSaving(true);
      setError(null);
      try {
        const result = await updateImageFocalMutation(
          project.id,
          project.slug,
          image.id,
          focalX,
          focalY,
        );
        if (!result.ok) {
          setError(result.error);
          return false;
        }
        onSaved(image.id, focalX, focalY);
        if (closeAfter) {
          onClose();
        }
        return true;
      } finally {
        persistLockRef.current = false;
        setSaving(false);
      }
    },
    [focalX, focalY, image, onClose, onSaved, project.id, project.slug],
  );

  const goNavigate = useCallback(
    async (dir: "prev" | "next") => {
      if (saving) return;
      if (dirty) {
        const ok = await persistFocal(false);
        if (!ok) return;
      }
      if (dir === "prev") {
        onBatchNavigatePrev?.();
      } else {
        onBatchNavigateNext?.();
      }
    },
    [dirty, onBatchNavigateNext, onBatchNavigatePrev, persistFocal, saving],
  );

  const onSaveAndNext = useCallback(async () => {
    if (!image || saving || !batchCanGoNext) return;
    const ok = await persistFocal(false);
    if (!ok) return;
    onBatchNavigateNext?.();
  }, [batchCanGoNext, image, onBatchNavigateNext, persistFocal, saving]);

  useEffect(() => {
    if (!open || !image) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (isArrowNavBlockedForBatch()) return;
        const go = e.key === "ArrowLeft" ? "prev" : "next";
        if (go === "prev" && !batchCanGoPrev) return;
        if (go === "next" && !batchCanGoNext) return;
        e.preventDefault();
        void goNavigate(go);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [batchCanGoNext, batchCanGoPrev, goNavigate, image, onClose, open]);

  const showBatchChrome = batchTotal > 1;

  if (!open || !image) {
    return null;
  }

  const navBtnClass =
    `inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg ` +
    `border border-zinc-700/70 bg-zinc-900/50 px-3 text-sm text-zinc-300 ${transitionQuick} ` +
    `hover:border-zinc-600 hover:bg-zinc-800/70 hover:text-zinc-100 disabled:cursor-not-allowed ` +
    `disabled:opacity-40 ${linkFocusVisible} ${tapSoft}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focal-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-950/90"
        onClick={onClose}
      />
      <div
        className={
          "relative z-[1] flex h-[min(90vh,800px)] w-full max-w-lg flex-col overflow-hidden " +
          "rounded-t-2xl border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/60 sm:rounded-2xl"
        }
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 px-4 py-3 sm:px-5">
          <h2 id="focal-modal-title" className="font-serif text-lg tracking-tight text-zinc-100">
            Focal point
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {showBatchChrome ? (
              <>
                <span
                  className="mr-1 hidden min-w-[3.25rem] text-right text-xs tabular-nums text-zinc-500 sm:inline"
                  aria-live="polite"
                >
                  {batchIndex} / {batchTotal}
                </span>
                <button
                  type="button"
                  className={navBtnClass}
                  aria-label="Previous image"
                  disabled={saving || !batchCanGoPrev}
                  onClick={() => void goNavigate("prev")}
                >
                  <span aria-hidden className="text-base leading-none">
                    ‹
                  </span>
                  <span className="ml-1 hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  className={navBtnClass}
                  aria-label="Next image"
                  disabled={saving || !batchCanGoNext}
                  onClick={() => void goNavigate("next")}
                >
                  <span className="mr-1 hidden sm:inline">Next</span>
                  <span aria-hidden className="text-base leading-none">
                    ›
                  </span>
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className={`rounded-md px-2 py-1.5 text-sm text-zinc-400 ${transitionQuick} hover:bg-zinc-800/80 hover:text-zinc-200 ${linkFocusVisible} ${tapSoft}`}
            >
              Close
            </button>
          </div>
        </header>
        {showBatchChrome ? (
          <p className="border-b border-zinc-800/40 px-4 py-1.5 text-center text-[11px] tabular-nums text-zinc-500 sm:hidden">
            Image {batchIndex} of {batchTotal}
          </p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 px-4 pt-3 sm:px-5">
            <p className="text-sm leading-relaxed text-zinc-500">
              Tap or click the preview where the subject should stay visible when cropped.
            </p>
            {error ? (
              <p className="mt-2 rounded-lg border border-red-900/40 bg-red-950/35 px-3 py-2 text-xs text-red-100/90">
                {error}
              </p>
            ) : null}
            <div className="mt-3">
              <button
                type="button"
                onClick={onReset}
                className={`cursor-pointer rounded-lg border border-zinc-700/70 bg-zinc-900/50 px-3 py-2 text-xs font-medium text-zinc-400 ${transitionQuick} hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200 ${linkFocusVisible} ${tapSoft}`}
              >
                Clear focal (use legacy CSS)
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-2 sm:px-5">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              <div
                key={image.id}
                className="flex h-full min-h-0 w-full items-center justify-center transition-opacity duration-200 ease-out"
              >
                <button
                  type="button"
                  onClick={onPick}
                  aria-label="Set focal point on image"
                  className={
                    `relative inline-block max-h-[56vh] max-w-full cursor-crosshair touch-manipulation ` +
                    `border-0 bg-transparent p-0 sm:max-h-[65vh] ${focusRing}`
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className={
                      "pointer-events-none block max-h-[50vh] w-auto max-w-full select-none " +
                      "object-contain sm:max-h-[62vh]"
                    }
                    style={{ objectPosition: `${displayX}% ${displayY}%` }}
                    draggable={false}
                  />
                  <span
                    className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/95 bg-white/40 shadow-lg ring-1 ring-black/50"
                    style={{ left: `${displayX}%`, top: `${displayY}%` }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-zinc-800/60 bg-zinc-950/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2.5 text-sm text-zinc-400 ${transitionQuick} hover:bg-zinc-800/60 hover:text-zinc-200 ${linkFocusVisible} ${tapSoft}`}
          >
            Cancel
          </button>
          {showBatchChrome && batchCanGoNext ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSaveAndNext()}
              className={`rounded-lg border border-zinc-700/80 bg-transparent px-3 py-2.5 text-sm text-zinc-400 ${transitionQuick} hover:border-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-200 disabled:cursor-wait disabled:opacity-50 ${linkFocusVisible} ${tapSoft}`}
            >
              {saving ? "Saving…" : "Save & next"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void persistFocal(true)}
            className={`min-h-[44px] min-w-[100px] rounded-lg border border-zinc-500/50 bg-zinc-100/10 px-4 py-2.5 text-sm font-medium text-zinc-100 ${transitionQuick} hover:bg-zinc-100/15 disabled:cursor-wait disabled:opacity-50 ${linkFocusVisible} ${tapSoft}`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
