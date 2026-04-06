import { PROJECT_IMAGES_BUCKET } from "@/lib/storage/project-image-paths";

/**
 * Extracts `images.storage_path` style key from a public object URL (client- or server-safe).
 */
export function tryParseProjectImageStoragePathFromPublicUrl(href: string): string | null {
  const t = href.trim();
  if (!t) {
    return null;
  }
  const marker = `/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/`;
  const i = t.indexOf(marker);
  if (i < 0) {
    return null;
  }
  const rest = t.slice(i + marker.length).split("?")[0] ?? "";
  const decoded = decodeURIComponent(rest.replace(/^\/+/, ""));
  return decoded.length > 0 ? decoded : null;
}
