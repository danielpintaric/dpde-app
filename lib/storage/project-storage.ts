import "server-only";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
