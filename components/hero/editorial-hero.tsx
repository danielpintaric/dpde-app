"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const DEFAULT_SLIDE_INTERVAL_MS = 8000;
const CROSSFADE_MS = 1000;

const heroImgClassName = "object-cover object-[center_42%]";

/** Same shell for both crossfade layers — only opacity differs during the fade. */
const crossfadeLayerShell = "pointer-events-none absolute inset-0 overflow-hidden";

const crossfadeImgClassName = `absolute inset-0 h-full w-full max-w-none ${heroImgClassName}`;

/**
 * One combined readability stack (was 4 overlapping dark layers → banding).
 * Soft stops only; top stays open, mid light, bottom strong for type.
 */
const heroReadabilityOverlayStyle: CSSProperties = {
  // First in list = top layer: vertical floor; under it = soft left vignette (less stacked banding).
  backgroundImage: [
    "linear-gradient(to top, rgb(9 9 11 / 0.88) 0%, rgb(9 9 11 / 0.72) 10%, rgb(9 9 11 / 0.34) 28%, rgb(9 9 11 / 0.14) 44%, rgb(9 9 11 / 0.06) 54%, rgb(9 9 11 / 0.02) 64%, rgb(9 9 11 / 0) 78%)",
    "linear-gradient(to right, rgb(0 0 0 / 0.32) 0%, rgb(0 0 0 / 0.09) 38%, rgb(0 0 0 / 0) 72%)",
  ].join(", "),
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

/**
 * Decode next hero frame before starting the fade so both layers paint without a decode hitch.
 * CORS failures fall through — `crossOrigin` omitted so anonymous default matches <img>.
 */
function ensureHeroImageReady(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const im = new Image();
    const done = () => resolve();
    im.onload = () => {
      if (typeof im.decode === "function") {
        im.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    im.onerror = done;
    im.src = src;
  });
}

export type EditorialHeroProps = {
  images: string[];
  children: React.ReactNode;
  /** Milliseconds between slides when multiple images; default 8000. */
  slideIntervalMs?: number;
  /** Defaults to "Introduction". */
  "aria-label"?: string;
};

export function EditorialHero({
  images,
  children,
  slideIntervalMs: slideIntervalMsProp,
  "aria-label": ariaLabel = "Introduction",
}: EditorialHeroProps) {
  const slideIntervalMs =
    typeof slideIntervalMsProp === "number" &&
    Number.isFinite(slideIntervalMsProp) &&
    slideIntervalMsProp >= 4000
      ? slideIntervalMsProp
      : DEFAULT_SLIDE_INTERVAL_MS;
  const imagesKey = images.join("\x01");
  const srcs = useMemo(() => {
    if (!imagesKey) {
      return [];
    }
    return imagesKey
      .split("\x01")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [imagesKey]);
  const srcsKey = srcs.join("\x01");

  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const enableSlideshow = mounted && srcs.length > 1 && !reducedMotion;

  const [idx, setIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(() => (srcs.length > 1 ? 1 % srcs.length : 0));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextIdxRef = useRef(nextIdx);
  useEffect(() => {
    nextIdxRef.current = nextIdx;
  }, [nextIdx]);

  const pausedRef = useRef(false);
  const transitioningRef = useRef(false);
  const fadeCommitPendingRef = useRef(false);
  const srcsRef = useRef(srcs);
  useEffect(() => {
    srcsRef.current = srcs;
  }, [srcs]);

  useEffect(() => {
    const n = srcs.length;
    fadeCommitPendingRef.current = false;
    if (n <= 1) {
      setIdx(0);
      setNextIdx(0);
      setIsTransitioning(false);
      transitioningRef.current = false;
      return;
    }
    setIdx(0);
    setNextIdx(1 % n);
    setIsTransitioning(false);
    transitioningRef.current = false;
  }, [srcsKey]);

  useEffect(() => {
    if (!enableSlideshow) {
      return;
    }
    const tick = () => {
      if (pausedRef.current || transitioningRef.current) {
        return;
      }
      const list = srcsRef.current;
      if (list.length < 2) {
        return;
      }
      const upcoming = list[nextIdxRef.current];
      if (!upcoming) {
        return;
      }
      // Lock interval ticks until this fade completes (or we abort below).
      transitioningRef.current = true;
      void ensureHeroImageReady(upcoming).then(() => {
        if (pausedRef.current) {
          transitioningRef.current = false;
          return;
        }
        const latest = srcsRef.current;
        if (latest.length < 2) {
          transitioningRef.current = false;
          return;
        }
        if (latest[nextIdxRef.current] !== upcoming) {
          transitioningRef.current = false;
          return;
        }
        fadeCommitPendingRef.current = true;
        setIsTransitioning(true);
      });
    };
    const id = window.setInterval(tick, slideIntervalMs);
    return () => window.clearInterval(id);
  }, [enableSlideshow, slideIntervalMs]);

  const onTopLayerTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== "opacity") {
        return;
      }
      if (!fadeCommitPendingRef.current || srcs.length < 2) {
        return;
      }
      fadeCommitPendingRef.current = false;
      const showNext = nextIdxRef.current;
      const len = srcs.length;
      setIdx(showNext);
      setNextIdx((showNext + 1) % len);
      // Snap opacities without CSS transition (see layerStyle) — avoids a second accidental fade.
      setIsTransitioning(false);
      transitioningRef.current = false;
    },
    [srcs.length],
  );

  /** Opacity-only; transition only while `isTransitioning` so reset does not animate. */
  const bottomLayerStyle = useMemo(
    () =>
      ({
        opacity: isTransitioning ? 0 : 1,
        transition: isTransitioning ? `opacity ${CROSSFADE_MS}ms ease-out` : "none",
        willChange: isTransitioning ? ("opacity" as const) : ("auto" as const),
      }) as const,
    [isTransitioning],
  );

  const topLayerStyle = useMemo(
    () =>
      ({
        opacity: isTransitioning ? 1 : 0,
        transition: isTransitioning ? `opacity ${CROSSFADE_MS}ms ease-out` : "none",
        willChange: isTransitioning ? ("opacity" as const) : ("auto" as const),
      }) as const,
    [isTransitioning],
  );

  useEffect(() => {
    if (!enableSlideshow || srcs.length < 2) {
      return;
    }
    const afterNext = srcs[(nextIdx + 1) % srcs.length];
    if (!afterNext) {
      return;
    }
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = afterNext;
    link.fetchPriority = "low";
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [enableSlideshow, srcsKey, nextIdx, idx]);

  const primarySrc = srcs[0];
  const showMedia = primarySrc != null;

  return (
    <section
      className="relative z-0 flex min-h-[100svh] w-full shrink-0 flex-col justify-end bg-zinc-950 pb-[env(safe-area-inset-bottom,0px)] text-zinc-100 sm:min-h-dvh"
      aria-label={ariaLabel}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {showMedia ? (
          enableSlideshow ? (
            <>
              <div className={crossfadeLayerShell} style={bottomLayerStyle}>
                <img
                  src={srcs[idx]!}
                  alt=""
                  sizes="100vw"
                  width={1920}
                  height={1080}
                  decoding="async"
                  draggable={false}
                  className={crossfadeImgClassName}
                />
              </div>
              <div
                className={crossfadeLayerShell}
                style={topLayerStyle}
                onTransitionEnd={onTopLayerTransitionEnd}
              >
                <img
                  src={srcs[nextIdx]!}
                  alt=""
                  sizes="100vw"
                  width={1920}
                  height={1080}
                  decoding="async"
                  draggable={false}
                  className={crossfadeImgClassName}
                />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={primarySrc}
                alt=""
                sizes="100vw"
                width={1920}
                height={1080}
                decoding="async"
                draggable={false}
                className={`absolute inset-0 h-full w-full max-w-none ${heroImgClassName}`}
              />
            </div>
          )
        ) : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={heroReadabilityOverlayStyle}
        aria-hidden
      />
      {/*
        Soft hand-off to page background: ~¼ Hero-Höhe, nach oben transparent — liest sich mit Selected Work als ein Fluss.
        Unter Hero-Text (z-10), über Bild.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(28%,12rem)] bg-gradient-to-t from-zinc-950 from-[35%] via-zinc-950/55 via-[55%] to-transparent sm:h-[min(26%,11rem)] lg:h-[min(24%,12rem)]"
        aria-hidden
      />

      <div className="relative z-10 w-full px-6 pb-24 pt-[calc(4.75rem+env(safe-area-inset-top,0px))] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 lg:pb-20">
        {children}
      </div>
    </section>
  );
}
