"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Exit: brief dip then out (~170ms total, no spring) */
const EXIT_PHASE1_MS = 70;
const EXIT_PHASE2_MS = 100;
/** Enter after new segment is rendered */
const ENTER_MS = 230;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstPathRef = useRef(true);
  const exitBusyRef = useRef(false);

  const runEnter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.transition = "";
      el.style.opacity = "1";
      return;
    }
    el.style.transition = "none";
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `opacity ${ENTER_MS}ms ease-out`;
        el.style.opacity = "1";
      });
    });
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isFirstPathRef.current) {
      isFirstPathRef.current = false;
      el.style.opacity = "1";
      el.style.transition = "";
      return;
    }

    runEnter();
  }, [pathname, runEnter]);

  useEffect(() => {
    const navigateAfterExit = (next: string) => {
      exitBusyRef.current = false;
      router.push(next);
    };

    const runExitThen = (next: string) => {
      const el = containerRef.current;
      if (!el || prefersReducedMotion()) {
        navigateAfterExit(next);
        return;
      }
      exitBusyRef.current = true;
      el.style.transition = `opacity ${EXIT_PHASE1_MS}ms ease-out`;
      el.style.opacity = "0.85";
      window.setTimeout(() => {
        el.style.transition = `opacity ${EXIT_PHASE2_MS}ms ease-out`;
        el.style.opacity = "0";
        window.setTimeout(() => navigateAfterExit(next), EXIT_PHASE2_MS);
      }, EXIT_PHASE1_MS);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (exitBusyRef.current) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const next = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;

      e.preventDefault();
      runExitThen(next);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [router]);

  return (
    <div ref={containerRef} className="flex min-h-0 w-full flex-1 flex-col opacity-100">
      {children}
    </div>
  );
}
