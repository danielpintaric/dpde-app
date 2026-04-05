import "server-only";

import { mapImageRow, type ImageRow } from "@/lib/db/map-supabase-rows";
import { createSupabasePublicClient } from "@/lib/db/supabase-public";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { Image } from "@/types/project";

/** Images for a project via anon client (no cookies). */
export async function listImagesByProjectIdPublic(projectId: string): Promise<Image[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw supabaseReadError("images list (public)", error.message, error.code);
  }

  const rows = (data ?? []) as ImageRow[];
  return rows.map(mapImageRow);
}
