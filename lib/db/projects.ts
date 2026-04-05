import "server-only";

import { mapProjectRow, type ProjectRow } from "@/lib/db/map-supabase-rows";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Project } from "@/types/project";

/**
 * Data access: `projects` table (all rows; use service layer to restrict catalog visibility).
 */
export async function listProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw supabaseReadError("projects list", error.message, error.code);
  }

  const rows = (data ?? []) as ProjectRow[];
  return rows.map(mapProjectRow);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("project by slug", error.message, error.code);
  }

  if (!data) {
    return null;
  }

  return mapProjectRow(data as ProjectRow);
}
