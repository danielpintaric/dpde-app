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
};

/** Overlay fade — calm settle-in (match `duration-[350ms]` in JSX) */
const OVERLAY_MS = 350;
/** Image scale/opacity — lightbox open/close shell (match `duration-[400ms]`) */
const IMAGE_MOTION_MS = 400;
/** Exit uses parallel overlay + image; buffer so unmount never clips the tail */
const UNMOUNT_AFTER_CLOSE_MS = Math.max(OVERLAY_MS, IMAGE_MOTION_MS) + 50;
type LayerSide = "a" | "b";

/** Next/prev crossfade — 220ms (`duration-[220ms]` fixed for Tailwind JIT) */
const LAYER_TRANSITION =
  "absolute inset-0 transition-opacity ease-out duration-[220ms] motion-reduce:duration-0 motion-reduce:transition-none";

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
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Stacked layers for nav crossfade */
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

  /** Crossfade when slide index changes (not on initial sync) */
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

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className={
        "fixed inset-0 z-[200] flex items-center justify-center p-4 outline-none ease-out motion-reduce:transition-none " +
        "transition-[opacity,backdrop-filter] duration-[350ms] motion-reduce:duration-200 " +
        (overlayVisible
          ? "bg-black/92 opacity-100 backdrop-blur-[2px]"
          : "pointer-events-none opacity-0 backdrop-blur-none")
      }
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        aria-label="Close viewer"
        className={`pointer-events-auto absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-sm text-zinc-500 hover:text-zinc-200 md:right-6 md:top-6 ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
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

      {canPrev ? (
        <button
          type="button"
          aria-label="Previous image"
          className={`pointer-events-auto absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-sm p-3 text-zinc-500 hover:text-zinc-200 md:left-4 ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          aria-label="Next image"
          className={`pointer-events-auto absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-sm p-3 text-zinc-500 hover:text-zinc-200 md:right-4 ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}

      <div
        className="pointer-events-auto flex max-h-[90vh] max-w-[90vw] cursor-zoom-out flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={
            "transition-[opacity,transform] ease-out duration-[400ms] motion-reduce:duration-200 motion-reduce:transition-none " +
            (overlayVisible
              ? "scale-100 opacity-100 delay-[60ms] motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:delay-0"
              : "scale-[0.985] opacity-0 delay-0 motion-reduce:scale-100 motion-reduce:opacity-0")
          }
        >
          <div className="relative isolate h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] min-h-[160px] min-w-[200px]">
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
                sizes="90vw"
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
                sizes="90vw"
                className="object-contain object-center"
                style={{ objectPosition: imgB.objectPosition ?? "center" }}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {active.caption ? (
          <p
            className={`mt-5 max-w-xl px-2 text-center font-serif text-[13px] font-normal leading-relaxed tracking-[-0.01em] text-zinc-500 transition-opacity ease-out motion-reduce:transition-none ${
              overlayVisible ? "opacity-100 delay-[95ms] motion-reduce:delay-0" : "opacity-0 delay-0"
            }`}
            style={{ transitionDuration: `${IMAGE_MOTION_MS}ms` }}
          >
            {active.caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
