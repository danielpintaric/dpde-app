import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { isProductionDeploy } from "@/lib/server-deployment";
import { logServerWarning } from "@/lib/server-log";
import {
  PROJECT_IMAGES_BUCKET,
  projectImageOriginalObjectPath,
} from "@/lib/storage/project-image-paths";

function uniqueOriginalFilename(originalName: string): string {
  const leaf =
    originalName.replace(/^\//, "").split(/[/\\]/).pop() || "image.jpg";
  const safe = leaf.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
  const base = safe || "image.jpg";
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rnd}-${base}`;
}
import type { Image } from "@/types/project";

/**
 * True when the row likely points at an object in `project-images` (not legacy import / external).
 */
export function shouldRemoveObjectFromBucket(image: Image): boolean {
  if (image.externalUrl?.trim()) {
    return false;
  }
  const path = image.storagePath.trim();
  if (path.startsWith("legacy/")) {
    return false;
  }
  return path.includes("/original/");
}

export async function uploadOriginalToProjectBucket(
  projectId: string,
  file: File,
): Promise<{ storagePath: string; storedFilename: string }> {
  const storedFilename = uniqueOriginalFilename(file.name);
  const storagePath = projectImageOriginalObjectPath(projectId, storedFilename);
  /** Service-Role: Storage-RLS für `anon`/JWT lässt Admin-Upload oft zuverlässiger zu als komplexe storage.objects-Policies. */
  const supabase = createSupabaseServiceRoleClient();
  if (process.env.NODE_ENV === "development" && !isProductionDeploy()) {
    logServerWarning(
      "admin-storage-upload",
      [
        "storage.upload: using service-role upload path",
        `bucket=${PROJECT_IMAGES_BUCKET}`,
        `path=${storagePath.slice(0, 72)}${storagePath.length > 72 ? "…" : ""}`,
      ].join(" · "),
    );
  }
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

  return { storagePath, storedFilename };
}

export async function removeObjectFromProjectBucketIfPresent(
  storagePath: string,
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
