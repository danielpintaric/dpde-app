import "server-only";

import { getBaseUrl } from "@/lib/public-config";

/** Absolute public URL for sharing: `https://…/client?token=…` (uses `NEXT_PUBLIC_SITE_URL` when set). */
export function buildClientAccessAbsoluteUrl(token: string): string {
  const base = getBaseUrl().replace(/\/+$/, "");
  return `${base}/client?token=${encodeURIComponent(token)}`;
}

/** Path + query only — stable if base URL is unknown in a context. */
export function buildClientAccessRelativePath(token: string): string {
  return `/client?token=${encodeURIComponent(token)}`;
}
