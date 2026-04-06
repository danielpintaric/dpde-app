import "server-only";

import { mapImageRow, type ImageRow } from "@/lib/db/map-supabase-rows";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Image } from "@/types/project";

/**
 * Data access: `images` table for one project.
 */
export async function listImagesByProjectId(
  projectId: string,
): Promise<Image[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw supabaseReadError("images list", error.message, error.code);
  }

  const rows = (data ?? []) as ImageRow[];
  return rows.map(mapImageRow);
}

function compareImagesByGalleryOrder(a: Image, b: Image): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }
  return a.createdAt.localeCompare(b.createdAt);
}

/**
 * All images belonging to the given projects (admin). Grouping/sorting per project is done in memory
 * because PostgREST ordering is not per-`project_id` when using `in(...)`.
 */
export async function listImagesByProjectIds(projectIds: string[]): Promise<Image[]> {
  if (projectIds.length === 0) {
    return [];
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .in("project_id", projectIds);

  if (error) {
    throw supabaseReadError("images list by projects", error.message, error.code);
  }

  const rows = (data ?? []) as ImageRow[];
  const images = rows.map(mapImageRow);
  images.sort((a, b) => {
    if (a.projectId !== b.projectId) {
      return a.projectId.localeCompare(b.projectId);
    }
    return compareImagesByGalleryOrder(a, b);
  });
  return images;
}
