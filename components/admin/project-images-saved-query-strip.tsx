"use client";

import { useEffect } from "react";

/**
 * Drops `?saved=` from the address bar after the flash, without triggering a
 * Next.js navigation (avoids RSC refetch while editing other rows).
 */
export function ProjectImagesSavedQueryStrip({ savedImageId }: { savedImageId: string | null }) {
  useEffect(() => {
    if (!savedImageId) {
      return;
    }
    const t = window.setTimeout(() => {
      const u = new URL(window.location.href);
      if (u.searchParams.get("saved") !== savedImageId) {
        return;
      }
      u.searchParams.delete("saved");
      const path = u.pathname + u.search;
      window.history.replaceState(window.history.state, "", path);
    }, 4500);
    return () => window.clearTimeout(t);
  }, [savedImageId]);

  return null;
}
