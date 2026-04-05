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
