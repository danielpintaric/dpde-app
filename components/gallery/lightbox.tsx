"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProjectImage } from "@/lib/portfolio-data";
import { resolveProjectImageObjectPosition } from "@/lib/image-object-position";
import {
  defaultImageToneClasses,
  galleryMotionEase,
  linkFocusVisible,
  scrollbarHiddenHorizontal,
  tapSoft,
  transitionQuick,
} from "@/lib/editorial";

type LightboxProps = {
  images: ProjectImage[];
  open: boolean;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
  /** Optional project title — shown quietly in the bottom bar when set */
  galleryTitle?: string;
};

/** Unified lightbox rhythm (open, crossfade, thumbs) */
const LB_MS = 200;
const OVERLAY_MS = LB_MS;
const IMAGE_ENTRANCE_MS = LB_MS;
const UNMOUNT_AFTER_CLOSE_MS = OVERLAY_MS + 70;
const BACKDROP_CLICK_SUPPRESS_MS = 420;

const SWIPE_MIN_PX = 48;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_MAX_DIST = 36;

const ZOOM_MAX = 2;
const ZOOM_PINCH_MAX = 2.25;

type LayerSide = "a" | "b";

const layerOpacity =
  `absolute inset-0 transition-opacity duration-[${LB_MS}ms] motion-reduce:duration-0 motion-reduce:transition-none ` +
  galleryMotionEase;

const closeBtnClass =
  "inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-600/22 " +
  "bg-zinc-950/18 text-zinc-400/80 opacity-[0.5] md:opacity-[0.36] " +
  `transition-[opacity,color,background-color,border-color,transform] duration-[${LB_MS}ms] ` +
  galleryMotionEase +
  " hover:opacity-100 hover:border-zinc-500/32 hover:bg-zinc-900/32 hover:text-zinc-200/95 " +
  "active:scale-[0.97] active:transition-[transform] active:duration-150 " +
  "sm:min-h-0 sm:min-w-0 sm:h-9 sm:w-9 sm:rounded-md";

const navArrowClass =
  "pointer-events-auto absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center " +
  "rounded-full border border-zinc-600/20 bg-zinc-950/15 text-zinc-400/75 " +
  "opacity-[0.5] md:opacity-[0.34] " +
  `transition-[opacity,transform,border-color,background-color,color] duration-[${LB_MS}ms] ` +
  galleryMotionEase +
  " hover:opacity-100 hover:border-zinc-500/30 hover:bg-zinc-900/25 hover:text-zinc-300/90 " +
  "active:scale-[0.96] active:opacity-100 " +
  "md:flex motion-reduce:transition-none";

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

function LightboxFillImage({
  src,
  objectPosition,
  imageFilterClass,
}: {
  src: string;
  objectPosition?: string;
  imageFilterClass?: string;
}) {
  const [ready, setReady] = useState(false);
  const tone = imageFilterClass?.trim() || defaultImageToneClasses;

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="95vw"
      onLoad={() => setReady(true)}
      className={`object-contain object-center ${tone} transition-opacity duration-[200ms] motion-reduce:transition-none motion-reduce:opacity-100 ${galleryMotionEase} ${ready ? "opacity-100" : "opacity-0"}`}
      style={{ objectPosition: objectPosition ?? "50% 50%" }}
      draggable={false}
    />
  );
}

function useFinePointerClickZoom() {
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return finePointer;
}

function clampPan(
  px: number,
  py: number,
  scale: number,
  width: number,
  height: number,
): { x: number; y: number } {
  if (scale <= 1) return { x: 0, y: 0 };
  const maxX = (width * (scale - 1)) / 2;
  const maxY = (height * (scale - 1)) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, px)),
    y: Math.max(-maxY, Math.min(maxY, py)),
  };
}

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

const LightboxThumbnailStrip = memo(function LightboxThumbnailStrip({
  images,
  activeIndex,
  onSelect,
}: {
  images: ProjectImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      className={
        "flex w-max min-w-0 max-w-[min(90vw,72rem)] snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth py-3 " +
        `${scrollbarHiddenHorizontal} ` +
        "[mask-image:linear-gradient(90deg,transparent,black_14px,black_calc(100%-14px),transparent)] " +
        "[-webkit-mask-image:linear-gradient(90deg,transparent,black_14px,black_calc(100%-14px),transparent)] sm:gap-3"
      }
      role="tablist"
      aria-label="Gallery thumbnails"
    >
      {images.map((img, i) => {
        const active = i === activeIndex;
        const tone = img.imageFilterClass?.trim() || defaultImageToneClasses;
        return (
          <button
            key={`${img.src}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Image ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`relative aspect-[4/5] w-14 shrink-0 snap-center overflow-hidden rounded-md border transition-[opacity,transform,border-color] duration-[200ms] sm:w-16 ${galleryMotionEase} ${
              active
                ? "z-[1] scale-[1.05] border-zinc-200/75 opacity-100"
                : "border-transparent opacity-[0.68] hover:opacity-[0.82]"
            } ${linkFocusVisible} ${tapSoft}`}
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="64px"
              className={`object-cover ${tone}`}
              style={{ objectPosition: resolveProjectImageObjectPosition(img) }}
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
});

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
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomToggleRef = useRef({ toggleDoubleTapZoom: () => {} });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomLiveRef = useRef(1);
  const [gestureActive, setGestureActive] = useState(false);
  const [pointerPanning, setPointerPanning] = useState(false);
  const [touchPanning, setTouchPanning] = useState(false);
  const panRef = useRef(pan);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomLiveRef.current = zoom;
  }, [zoom]);

  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(0);
  const [activeLayer, setActiveLayer] = useState<LayerSide>("a");
  const activeLayerRef = useRef<LayerSide>("a");
  const navGenRef = useRef(0);
  const navInitRef = useRef(false);
  const lastNavTargetRef = useRef<number | null>(null);
  const rafPairRef = useRef<{ outer: number | null; inner: number | null }>({ outer: null, inner: null });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);
  const lastTapRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const suppressBackdropCloseRef = useRef(false);
  const backdropSuppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const touchPanRef = useRef<{
    startX: number;
    startY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);
  const pinchRef = useRef<{ d0: number; z0: number } | null>(null);
  const pointerMovedRef = useRef(false);

  const finePointer = useFinePointerClickZoom();

  const count = images.length;
  const clampedIndex = count === 0 ? 0 : Math.min(Math.max(0, activeIndex), count - 1);
  const active = images[clampedIndex];

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    pinchRef.current = null;
    panDragRef.current = null;
    setGestureActive(false);
    setPointerPanning(false);
    setTouchPanning(false);
  }, []);

  const toggleDoubleTapZoom = useCallback(() => {
    setZoom((z) => (z <= 1 ? ZOOM_MAX : 1));
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    zoomToggleRef.current.toggleDoubleTapZoom = toggleDoubleTapZoom;
  }, [toggleDoubleTapZoom]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  /* eslint-disable react-hooks/set-state-in-effect -- zoom/pan reset on index; modal mount; layer crossfade */
  useEffect(() => {
    resetView();
  }, [clampedIndex, resetView]);

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
      suppressBackdropCloseRef.current = false;
      if (backdropSuppressTimerRef.current !== null) {
        clearTimeout(backdropSuppressTimerRef.current);
        backdropSuppressTimerRef.current = null;
      }
      resetView();
      const { outer, inner } = rafPairRef.current;
      if (outer !== null) cancelAnimationFrame(outer);
      if (inner !== null) cancelAnimationFrame(inner);
      rafPairRef.current = { outer: null, inner: null };
    }
  }, [open, resetView]);

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
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open || count === 0) return;
    const preload = (i: number) => {
      if (i < 0 || i >= count) return;
      const im = new window.Image();
      im.src = images[i]!.src;
    };
    preload(clampedIndex - 1);
    preload(clampedIndex + 1);
  }, [open, clampedIndex, count, images]);

  useScrollLock(mounted);

  const goPrev = useCallback(() => {
    if (clampedIndex <= 0) return;
    onActiveIndexChange(clampedIndex - 1);
  }, [clampedIndex, onActiveIndexChange]);

  const goNext = useCallback(() => {
    if (clampedIndex >= count - 1) return;
    onActiveIndexChange(clampedIndex + 1);
  }, [clampedIndex, count, onActiveIndexChange]);

  const selectThumb = useCallback(
    (i: number) => {
      if (i === clampedIndex) return;
      onActiveIndexChange(i);
    },
    [clampedIndex, onActiveIndexChange],
  );

  const suppressBackdropClose = useCallback(() => {
    suppressBackdropCloseRef.current = true;
    if (backdropSuppressTimerRef.current !== null) {
      clearTimeout(backdropSuppressTimerRef.current);
    }
    backdropSuppressTimerRef.current = setTimeout(() => {
      suppressBackdropCloseRef.current = false;
      backdropSuppressTimerRef.current = null;
    }, BACKDROP_CLICK_SUPPRESS_MS);
  }, []);

  const handleBackdropClose = useCallback(
    (e: React.MouseEvent) => {
      if (suppressBackdropCloseRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClose();
    },
    [onClose],
  );

  const applyPan = useCallback((nx: number, ny: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPan(clampPan(nx, ny, zoomLiveRef.current, width, height));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPan((p) => {
        const { width, height } = el.getBoundingClientRect();
        return clampPan(p.x, p.y, zoomLiveRef.current, width, height);
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    setPan((p) => {
      const { width, height } = el.getBoundingClientRect();
      return clampPan(p.x, p.y, zoom, width, height);
    });
  }, [zoom]);

  useEffect(() => {
    if (!mounted || !open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (zoom > 1) {
          resetView();
          return;
        }
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (zoom > 1) return;
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (zoom > 1) return;
        goNext();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, onClose, goPrev, goNext, zoom, resetView]);

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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = touchDistance(e.touches[0]!, e.touches[1]!);
      pinchRef.current = { d0: d, z0: zoomLiveRef.current };
      setGestureActive(true);
      touchStartRef.current = null;
      touchPanRef.current = null;
      return;
    }
    const t = e.touches[0];
    if (!t) return;
    if (zoomLiveRef.current > 1) {
      touchPanRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        originPanX: panRef.current.x,
        originPanY: panRef.current.y,
      };
      touchStartRef.current = null;
      touchMovedRef.current = false;
      return;
    }
    touchPanRef.current = null;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    touchMovedRef.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const d = touchDistance(e.touches[0]!, e.touches[1]!);
        const { d0, z0 } = pinchRef.current;
        const next = Math.min(ZOOM_PINCH_MAX, Math.max(1, (z0 * d) / d0));
        setZoom(next);
        zoomLiveRef.current = next;
        setPan((p) => {
          const el = viewportRef.current;
          if (!el) return p;
          const { width, height } = el.getBoundingClientRect();
          return clampPan(p.x, p.y, next, width, height);
        });
        e.preventDefault();
        return;
      }

      const tp = touchPanRef.current;
      if (zoomLiveRef.current > 1 && tp && e.touches.length === 1) {
        const t = e.touches[0];
        if (!t) return;
        const dx = t.clientX - tp.startX;
        const dy = t.clientY - tp.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          touchMovedRef.current = true;
          setTouchPanning(true);
        }
        e.preventDefault();
        applyPan(tp.originPanX + dx, tp.originPanY + dy);
        return;
      }

      const start = touchStartRef.current;
      if (!start) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        touchMovedRef.current = true;
      }
    },
    [applyPan],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null;
        setGestureActive(false);
      }

      const hadPanSession = touchPanRef.current !== null;
      touchPanRef.current = null;
      setTouchPanning(false);

      const start = touchStartRef.current;
      touchStartRef.current = null;

      const t = e.changedTouches[0];
      if (!t) return;

      if (hadPanSession && touchMovedRef.current) {
        lastTapRef.current = null;
        return;
      }

      const target = e.target as HTMLElement | null;
      const onImage = Boolean(target?.closest("[data-lightbox-image]"));

      if (onImage && !touchMovedRef.current) {
        const now = Date.now();
        const last = lastTapRef.current;
        if (
          last &&
          now - last.t < DOUBLE_TAP_MS &&
          Math.abs(t.clientX - last.x) < DOUBLE_TAP_MAX_DIST &&
          Math.abs(t.clientY - last.y) < DOUBLE_TAP_MAX_DIST
        ) {
          zoomToggleRef.current.toggleDoubleTapZoom();
          lastTapRef.current = null;
          return;
        }
        lastTapRef.current = { t: now, x: t.clientX, y: t.clientY };
      }

      if (!start) return;

      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const moved = touchMovedRef.current;

      if (zoomLiveRef.current <= 1 && moved && Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) goPrev();
        else goNext();
        lastTapRef.current = null;
        suppressBackdropClose();
      }
    },
    [goPrev, goNext, suppressBackdropClose],
  );

  const onPointerDownImage = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (zoom <= 1) {
        pointerMovedRef.current = false;
        return;
      }
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setPointerPanning(true);
      setGestureActive(true);
      panDragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      pointerMovedRef.current = false;
    },
    [zoom],
  );

  const onPointerMoveImage = useCallback(
    (e: React.PointerEvent) => {
      const drag = panDragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) pointerMovedRef.current = true;
      applyPan(drag.panX + dx, drag.panY + dy);
    },
    [applyPan],
  );

  const onPointerUpImage = useCallback((e: React.PointerEvent) => {
    const drag = panDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    panDragRef.current = null;
    setPointerPanning(false);
    setGestureActive(false);
  }, []);

  const onClickImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!finePointer) return;
      if (pointerMovedRef.current) return;
      if (zoom > 1) {
        setZoom(1);
        zoomLiveRef.current = 1;
        setPan({ x: 0, y: 0 });
        return;
      }
      setZoom(ZOOM_MAX);
      zoomLiveRef.current = ZOOM_MAX;
      setPan({ x: 0, y: 0 });
    },
    [finePointer, zoom],
  );

  const showStrip = count > 1;
  const showCounter = count > 1;
  const titleTrimmed = galleryTitle?.trim();

  const entranceMotion = useMemo(
    () =>
      "transition-[opacity,transform] duration-[200ms] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100 " +
      galleryMotionEase +
      " " +
      (overlayVisible
        ? "scale-100 opacity-100"
        : "scale-[0.989] opacity-0 motion-reduce:scale-100 motion-reduce:opacity-0"),
    [overlayVisible],
  );

  const cursorClass =
    finePointer && zoom <= 1
      ? "cursor-zoom-in"
      : finePointer && zoom > 1
        ? pointerPanning
          ? "cursor-grabbing"
          : "cursor-zoom-out"
        : zoom > 1
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default";

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
      aria-label={titleTrimmed ? `Image viewer — ${titleTrimmed}` : "Image viewer"}
      className={
        "group fixed inset-0 z-[200] flex min-h-0 flex-col overflow-hidden overscroll-none outline-none " +
        "touch-manipulation motion-reduce:transition-none " +
        "bg-gradient-to-b from-black/[0.9] via-black/[0.925] to-black/[0.93] " +
        "transition-[opacity] motion-reduce:duration-150 " +
        galleryMotionEase +
        " " +
        (overlayVisible ? "opacity-100" : "pointer-events-none opacity-0")
      }
      style={{ transitionDuration: `${OVERLAY_MS}ms` }}
      onClick={handleBackdropClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        aria-label="Close viewer"
        className={`absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-30 ${closeBtnClass} ${transitionQuick} ${linkFocusVisible} ${tapSoft}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className="relative flex min-h-0 flex-1 flex-col"
        onClick={handleBackdropClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-4 pt-[max(4.25rem,env(safe-area-inset-top))] pb-5 sm:px-6 sm:pt-16 sm:pb-7"
          onClick={handleBackdropClose}
        >
          <div
            className="group relative mx-auto flex w-full max-w-[95vw] shrink-0 items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {canPrev ? (
              <button
                type="button"
                aria-label="Previous image"
                disabled={zoom > 1}
                className={`${navArrowClass} left-[max(0.5rem,env(safe-area-inset-left))] md:left-4 ${transitionQuick} ${linkFocusVisible} ${tapSoft} disabled:pointer-events-none disabled:opacity-[0.12]`}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <svg
                  width="20"
                  height="20"
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
                disabled={zoom > 1}
                className={`${navArrowClass} right-[max(0.5rem,env(safe-area-inset-right))] md:right-4 ${transitionQuick} ${linkFocusVisible} ${tapSoft} disabled:pointer-events-none disabled:opacity-[0.12]`}
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <svg
                  width="20"
                  height="20"
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
              data-lightbox-image
              ref={viewportRef}
              className={`relative mx-auto h-[min(90vh,90dvh)] w-full max-w-[95vw] min-h-[160px] select-none overflow-hidden ${entranceMotion} ${cursorClass} ${zoom > 1 ? "touch-none" : ""}`}
              style={{
                transitionDuration: `${IMAGE_ENTRANCE_MS}ms`,
                touchAction: zoom > 1 ? "none" : "manipulation",
              }}
              onPointerDown={onPointerDownImage}
              onPointerMove={onPointerMoveImage}
              onPointerUp={onPointerUpImage}
              onPointerCancel={onPointerUpImage}
              onClick={onClickImage}
            >
              <div
                className="relative h-full min-h-0 w-full will-change-transform motion-reduce:transition-none"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition:
                    gestureActive || pointerPanning || touchPanning
                      ? "none"
                      : `transform ${LB_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              >
                <div className="relative isolate h-full w-full min-h-[120px]">
                  <div
                    className={
                      layerOpacity +
                      (activeLayer === "a"
                        ? " z-[2] opacity-100"
                        : " z-[1] cursor-default opacity-0 pointer-events-none")
                    }
                  >
                    <LightboxFillImage
                      key={`a-${imgA.src}`}
                      src={imgA.src}
                      objectPosition={resolveProjectImageObjectPosition(imgA)}
                      imageFilterClass={imgA.imageFilterClass}
                    />
                  </div>
                  <div
                    className={
                      layerOpacity +
                      (activeLayer === "b"
                        ? " z-[2] opacity-100"
                        : " z-[1] cursor-default opacity-0 pointer-events-none")
                    }
                  >
                    <LightboxFillImage
                      key={`b-${imgB.src}`}
                      src={imgB.src}
                      objectPosition={resolveProjectImageObjectPosition(imgB)}
                      imageFilterClass={imgB.imageFilterClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCounter || titleTrimmed ? (
          <div
            className="pointer-events-none shrink-0 px-4 pb-1.5 pt-2 text-center opacity-[0.62]"
            aria-hidden={!(showCounter || titleTrimmed)}
          >
            {titleTrimmed ? (
              <p className="truncate text-[11px] font-normal tracking-[0.02em] text-zinc-600/65 md:text-xs">
                {titleTrimmed}
              </p>
            ) : null}
            {showCounter ? (
              <p className="mt-0.5 tabular-nums text-[11px] text-zinc-600/65 md:text-xs" aria-live="polite">
                {clampedIndex + 1} / {count}
              </p>
            ) : null}
          </div>
        ) : null}

        {showStrip ? (
          <div
            className="relative z-20 shrink-0 border-t border-zinc-800/22 bg-zinc-950/68 backdrop-blur-[6px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full justify-center px-4 pt-1 mt-4 sm:mt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <LightboxThumbnailStrip images={images} activeIndex={clampedIndex} onSelect={selectThumb} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
