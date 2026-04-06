import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { PROJECT_IMAGES_BUCKET } from "@/lib/storage/project-image-paths";
import { getProjectImagePublicUrl } from "@/lib/storage/project-image-public-url";
import {
  isSiteHeroStoragePath,
  siteHeroObjectPath,
  type SiteHeroSlot,
} from "@/lib/storage/site-hero-paths";

function uniqueHeroFilename(originalName: string): string {
  const leaf =
    originalName.replace(/^\//, "").split(/[/\\]/).pop() || "image.jpg";
  const safe = leaf.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
  const base = safe || "image.jpg";
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rnd}-${base}`;
}

export async function uploadSiteHeroImage(
  slot: SiteHeroSlot,
  file: File,
): Promise<{ storagePath: string; publicUrl: string }> {
  const storedFilename = uniqueHeroFilename(file.name);
  const storagePath = siteHeroObjectPath(slot, storedFilename);
  const supabase = createSupabaseServiceRoleClient();
  const body = await file.arrayBuffer();
  const contentType = file.type || "application/octet-stream";

  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(storagePath, body, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return {
    storagePath,
    publicUrl: getProjectImagePublicUrl(storagePath),
  };
}

export async function removeSiteHeroObjectIfPresent(storagePath: string): Promise<void> {
  const p = storagePath.trim().replace(/^\//, "");
  if (!p || !isSiteHeroStoragePath(p)) {
    return;
  }
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([p]);
  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
