import { getProjectImagePublicUrl } from "@/lib/storage/project-image-public-url";
import type { Image } from "@/types/project";

/** Preview URL für Admin-Thumbnails (öffentliche Storage-URL oder externe Legacy-URL). */
export function getAdminImagePreviewUrl(image: Image): string {
  const external = image.externalUrl?.trim();
  if (external) {
    return external;
  }
  return getProjectImagePublicUrl(image.storagePath);
}
