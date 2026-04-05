import { getSupabasePublicConfig } from "@/lib/db/supabase-env";
import { PROJECT_IMAGES_BUCKET } from "@/lib/storage/project-image-paths";

/**
 * Builds the **public** object URL for the `project-images` bucket.
 *
 * Requires:
 * - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (via `getSupabasePublicConfig`)
 * - Bucket `project-images` configured as **public** in Supabase, otherwise the URL will not load for anonymous users.
 *
 * For **private** buckets, replace this later with `createSignedUrl` (server-side).
 *
 * @param storagePath Value from `images.storage_path` (no leading `/` recommended).
 */
export function getProjectImagePublicUrl(storagePath: string): string {
  const { url } = getSupabasePublicConfig();
  const base = url.replace(/\/$/, "");
  const path = storagePath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/${path}`;
}
