"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { computeActiveSiteSectionId } from "@/lib/admin/site-settings-active-section";
import { SITE_SECTION_IDS } from "@/lib/admin/site-sections";

function fallbackMobileTargetLinePx(): number {
  if (typeof window === "undefined") {
    return 140;
  }
  const mql = window.matchMedia("(min-width: 640px)");
  const headerBand = mql.matches ? 64 : 56;
  const navBand = 52;
  const gap = 24;
  return headerBand + navBand + gap;
}

function fallbackDesktopTargetLinePx(): number {
  return 104;
}

/**
 * Shared scroll-spy for Site Settings: desktop uses sidebar nav bottom; mobile uses sticky pill bar bottom.
 */
export function useSiteSettingsScrollSpy(
  mobileStickyRef: RefObject<HTMLElement | null>,
  sidebarNavRef: RefObject<HTMLElement | null>,
): { activeSectionId: string | null } {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(SITE_SECTION_IDS[0] ?? null);
  const previousIdRef = useRef<string | null>(SITE_SECTION_IDS[0] ?? null);
  const rafRef = useRef<number | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;

      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      let targetLine: number;
      if (isLg) {
        const sb = sidebarNavRef.current;
        targetLine = sb ? sb.getBoundingClientRect().bottom + 10 : fallbackDesktopTargetLinePx();
      } else {
        const mb = mobileStickyRef.current;
        targetLine = mb ? mb.getBoundingClientRect().bottom + 24 : fallbackMobileTargetLinePx();
      }

      const next = computeActiveSiteSectionId(targetLine, previousIdRef.current);
      previousIdRef.current = next;
      setActiveSectionId((prev) => (prev === next ? prev : next));
    });
  }, [mobileStickyRef, sidebarNavRef]);

  useLayoutEffect(() => {
    scheduleUpdate();
    let inner: number | null = null;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(scheduleUpdate);
    });
    return () => {
      cancelAnimationFrame(outer);
      if (inner != null) {
        cancelAnimationFrame(inner);
      }
    };
  }, [scheduleUpdate]);

  useEffect(() => {
    const thresholds = [0, 0.05, 0.12, 0.25, 0.45, 0.65, 0.85, 1];
    const observer = new IntersectionObserver(scheduleUpdate, {
      root: null,
      rootMargin: "-72px 0px -45% 0px",
      threshold: thresholds,
    });

    for (const id of SITE_SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      scheduleUpdate();
    };
    mq.addEventListener("change", onMq);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      mq.removeEventListener("change", onMq);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleUpdate]);

  return { activeSectionId };
}
