"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/lib/portfolio-data";
import { linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";

type LightboxProps = {
  images: ProjectImage[];
  open: boolean;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
  /** Optional project title — shown quietly in the header when set */
  galleryTitle?: string;
};

/** Overlay + shell — calm fade (match duration in classNames) */
const OVERLAY_MS = 220;
/** Image shell open/close */
const IMAGE_MOTION_MS = 200;
const UNMOUNT_AFTER_CLOSE_MS = Math.max(OVERLAY_MS, IMAGE_MOTION_MS) + 60;

type LayerSide = "a" | "b";

const LAYER_TRANSITION =
  "absolute inset-0 transition-opacity ease-out duration-200 motion-reduce:duration-0 motion-reduce:transition-none";

const glassCloseBtn =
  "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-700/55 bg-zinc-900/75 text-zinc-300 shadow-sm backdrop-blur-md transition-[background-color,color,border-color] duration-200 hover:border-zinc-600/70 hover:bg-zinc-800/85 hover:text-zinc-100 md:h-11 md:w-11";

const glassNavBtn =
  "pointer-events-auto absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-700/55 bg-zinc-900/75 text-zinc-300 shadow-sm backdrop-blur-md transition-[background-color,color,border-color] duration-200 hover:border-zinc-600/70 hover:bg-zinc-800/85 hover:text-zinc-100 active:scale-[0.98] md:h-12 md:w-12";

/** Stable stage box — explicit height so object-contain + fill layout is stable */
const stageBoxClass =
  "relative isolate mx-auto h-[min(76vh,calc(100svh-9.25rem))] w-full max-w-[min(96vw,1440px)] min-h-[180px] " +
  "sm:h-[min(80vh,calc(100svh-8.5rem))] md:h-[min(82vh,calc(100svh-8rem))] lg:h-[min(84vh,calc(100svh-7.5rem))]";

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export function Lightbox({
  images,
  open,
  activeIndex,
  onActiveIndexChange,
  onClose,
  galleryTitle,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(0);
  const [activeLayer, setActiveLayer] = useState<LayerSide>("a");
  const activeLayerRef = useRef<LayerSide>("a");
  const navGenRef = useRef(0);
  const navInitRef = useRef(false);
  const lastNavTargetRef = useRef<number | null>(null);
  const rafPairRef = useRef<{ outer: number | null; inner: number | null }>({ outer: null, inner: null });

  const count = images.length;
  const clampedIndex = count === 0 ? 0 : Math.min(Math.max(0, activeIndex), count - 1);
  const active = images[clampedIndex];

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setOverlayVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setOverlayVisible(false);
    const t = window.setTimeout(() => setMounted(false), UNMOUNT_AFTER_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      navInitRef.current = false;
      navGenRef.current = 0;
      lastNavTargetRef.current = null;
      const { outer, inner } = rafPairRef.current;
      if (outer !== null) cancelAnimationFrame(outer);
      if (inner !== null) cancelAnimationFrame(inner);
      rafPairRef.current = { outer: null, inner: null };
    }
  }, [open]);

  useEffect(() => {
    if (!mounted || !overlayVisible || count === 0) return;

    if (!navInitRef.current) {
      navInitRef.current = true;
      setIndexA(clampedIndex);
      setIndexB(clampedIndex);
      setActiveLayer("a");
      activeLayerRef.current = "a";
      lastNavTargetRef.current = clampedIndex;
      return;
    }

    if (lastNavTargetRef.current === clampedIndex) return;
    lastNavTargetRef.current = clampedIndex;

    const gen = ++navGenRef.current;
    const front = activeLayerRef.current;
    const target = clampedIndex;

    if (front === "a") {
      setIndexB(target);
    } else {
      setIndexA(target);
    }

    const prev = rafPairRef.current;
    if (prev.outer !== null) cancelAnimationFrame(prev.outer);
    if (prev.inner !== null) cancelAnimationFrame(prev.inner);

    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => {
        rafPairRef.current.inner = null;
        if (gen !== navGenRef.current) return;
        const next: LayerSide = front === "a" ? "b" : "a";
        setActiveLayer(next);
        activeLayerRef.current = next;
      });
      rafPairRef.current.inner = inner;
    });
    rafPairRef.current.outer = outer;

    return () => {
      const { outer: o, inner: i } = rafPairRef.current;
      if (o !== null) cancelAnimationFrame(o);
      if (i !== null) cancelAnimationFrame(i);
      rafPairRef.current = { outer: null, inner: null };
    };
  }, [clampedIndex, mounted, overlayVisible, count]);

  useScrollLock(mounted);

  const goPrev = useCallback(() => {
    if (clampedIndex <= 0) return;
    onActiveIndexChange(clampedIndex - 1);
  }, [clampedIndex, onActiveIndexChange]);

  const goNext = useCallback(() => {
    if (clampedIndex >= count - 1) return;
    onActiveIndexChange(clampedIndex + 1);
  }, [clampedIndex, count, onActiveIndexChange]);

  useEffect(() => {
    if (!mounted || !open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, onClose, goPrev, goNext]);

  useEffect(() => {
    if (!mounted || !open) return;
    closeButtonRef.current?.focus();
  }, [mounted, open, clampedIndex]);

  useEffect(() => {
    if (!mounted || !open) return;
    const root = containerRef.current;
    if (!root) return;

    const selectors =
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = getFocusables();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [mounted, open]);

  if (!mounted || count === 0 || !active) return null;

  const canPrev = clampedIndex > 0;
  const canNext = clampedIndex < count - 1;

  const safe = (i: number) => images[Math.min(Math.max(0, i), count - 1)]!;
  const imgA = safe(indexA);
  const imgB = safe(indexB);

  const showCounter = count > 1;
  const titleTrimmed = galleryTitle?.trim();

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={titleTrimmed ? `Image viewer — ${titleTrimmed}` : "Image viewer"}
      className={
        "fixed inset-0 z-[200] flex min-h-0 flex-col outline-none motion-reduce:transition-none " +
        "transition-[opacity,backdrop-filter] ease-out duration-200 motion-reduce:duration-150 " +
        (overlayVisible
          ? "bg-zinc-950/95 opacity-100 backdrop-blur-[3px]"
          : "pointer-events-none opacity-0 backdrop-blur-none")
      }
    >
      {/* No backdrop click-to-close — avoids accidental exits; Escape + close control remain */}
      <header
        className={
          "flex shrink-0 items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] " +
          "sm:px-6 md:px-10 md:pb-4 lg:px-12"
        }
      >
        <div className="grid min-h-[2.75rem] w-full grid-cols-[1fr_auto_1fr] items-center gap-x-2 md:gap-x-4">
          <div className="min-w-0 justify-self-start">
            {titleTrimmed ? (
              <p className="truncate text-left text-[11px] font-normal tracking-[0.02em] text-zinc-400 md:text-xs">
                {titleTrimmed}
              </p>
            ) : null}
          </div>
          {showCounter ? (
            <p
              className="justify-self-center tabular-nums text-[11px] text-zinc-400 md:text-xs"
              aria-live="polite"
            >
              {clampedIndex + 1} / {count}
            </p>
          ) : (
            <span className="justify-self-center" aria-hidden />
          )}
          <div className="justify-self-end">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close viewer"
              className={`${glassCloseBtn} ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
              onClick={onClose}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={
          "relative flex min-h-0 flex-1 touch-pan-y flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] " +
          "sm:px-5 md:px-8 lg:px-12"
        }
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {canPrev ? (
            <button
              type="button"
              aria-label="Previous image"
              className={`${glassNavBtn} left-[max(0.5rem,env(safe-area-inset-left))] md:left-4 lg:left-6 ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                aria-hidden
              >
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          {canNext ? (
            <button
              type="button"
              aria-label="Next image"
              className={`${glassNavBtn} right-[max(0.5rem,env(safe-area-inset-right))] md:right-4 lg:right-6 ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                aria-hidden
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          <div
            className="pointer-events-auto flex min-h-0 w-full max-w-[min(96vw,1440px)] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div
              className={
                "w-full transition-[opacity,transform] ease-out duration-200 motion-reduce:transition-none " +
                (overlayVisible
                  ? "scale-100 opacity-100 delay-75 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:delay-0"
                  : "scale-[0.99] opacity-0 delay-0 motion-reduce:scale-100 motion-reduce:opacity-0")
              }
            >
              <div className={stageBoxClass}>
                <div
                  className={
                    LAYER_TRANSITION +
                    (activeLayer === "a"
                      ? " z-[2] opacity-100"
                      : " z-[1] cursor-default opacity-0 pointer-events-none")
                  }
                >
                  <Image
                    src={imgA.src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 96vw, 1440px"
                    className="object-contain object-center"
                    style={{ objectPosition: imgA.objectPosition ?? "center" }}
                    draggable={false}
                  />
                </div>
                <div
                  className={
                    LAYER_TRANSITION +
                    (activeLayer === "b"
                      ? " z-[2] opacity-100"
                      : " z-[1] cursor-default opacity-0 pointer-events-none")
                  }
                >
                  <Image
                    src={imgB.src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 96vw, 1440px"
                    className="object-contain object-center"
                    style={{ objectPosition: imgB.objectPosition ?? "center" }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {active.caption ? (
              <p
                className={`mt-4 max-w-xl px-2 text-center font-serif text-[13px] font-normal leading-relaxed tracking-[-0.01em] text-zinc-500 transition-opacity ease-out motion-reduce:transition-none sm:mt-5 ${
                  overlayVisible ? "opacity-100 delay-100 motion-reduce:delay-0" : "opacity-0 delay-0"
                }`}
                style={{ transitionDuration: `${IMAGE_MOTION_MS}ms` }}
              >
                {active.caption}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
