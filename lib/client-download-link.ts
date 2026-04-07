/**
 * Builds the href for token-gated image download (used by Client Area UI).
 * Authorization is enforced server-side in `/api/client/download`.
 */
export function buildClientImageDownloadHref(
  token: string,
  projectSlug: string,
  imageId: string,
): string {
  const q = new URLSearchParams({
    token: token.trim(),
    project: projectSlug.trim(),
    image: imageId.trim(),
  });
  return `/api/client/download?${q.toString()}`;
}

/** Matches `Content-Disposition` attachment responses (`filename="…"`). */
export function parseAttachmentFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const m = /filename="([^"]+)"/i.exec(header);
  return m?.[1]?.trim() || null;
}

export type ClientImageBlobDownloadResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Browser-only: GET the attachment without full navigation (avoids client-side router transitions to `/api/...`).
 */
export async function downloadClientImageViaFetch(relativeHref: string): Promise<ClientImageBlobDownloadResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { ok: false, message: "Download is only available in the browser." };
  }

  const url = relativeHref.startsWith("http")
    ? relativeHref
    : new URL(relativeHref, window.location.origin).toString();

  try {
    const res = await fetch(url, { method: "GET", credentials: "same-origin" });
    const cd = res.headers.get("Content-Disposition");
    const filename = parseAttachmentFilenameFromContentDisposition(cd) ?? "download";

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).trim();
      return {
        ok: false,
        message: text.slice(0, 200) || `Download failed (${res.status})`,
      };
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download failed.";
    return { ok: false, message };
  }
}

/**
 * POST `/api/client/download-selected` — same-origin blob download (no SPA navigation).
 */
export async function downloadClientSelectionZipPost(
  token: string,
  projectSlug: string,
): Promise<ClientImageBlobDownloadResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { ok: false, message: "Download is only available in the browser." };
  }

  try {
    const res = await fetch("/api/client/download-selected", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim(), project: projectSlug.trim() }),
    });
    const cd = res.headers.get("Content-Disposition");
    const filename =
      parseAttachmentFilenameFromContentDisposition(cd) ?? `${projectSlug.trim() || "project"}-selection.zip`;

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).trim();
      return {
        ok: false,
        message: text.slice(0, 200) || `Download failed (${res.status})`,
      };
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download failed.";
    return { ok: false, message };
  }
}
