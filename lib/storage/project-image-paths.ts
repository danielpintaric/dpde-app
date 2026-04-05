/**
 * V1 Supabase Storage conventions for portfolio originals.
 * Bucket must exist in Supabase (private or public per product decision later).
 */

export const PROJECT_IMAGES_BUCKET = "project-images" as const;

/**
 * Object key for the full-resolution upload, e.g.
 * `projects/<projectId>/original/<filename>`.
 */
export function projectImageOriginalObjectPath(
  projectId: string,
  filename: string,
): string {
  const safe = filename.replace(/^\//, "");
  return `projects/${projectId}/original/${safe}`;
}
