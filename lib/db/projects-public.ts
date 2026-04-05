import "server-only";

import { mapProjectRow, type ProjectRow } from "@/lib/db/map-supabase-rows";
import { createSupabasePublicClient } from "@/lib/db/supabase-public";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { Project } from "@/types/project";

/**
 * Anonymous Supabase reads (no cookies). Only **`public`** rows — for `/portfolio`, sitemap, SSG paths.
 *
 * For session/admin access to all rows, use {@link listProjects} in `projects.ts`.
 */
export async function listPublishedProjectsPublic(): Promise<Project[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw supabaseReadError("projects list (public)", error.message, error.code);
  }

  const rows = (data ?? []) as ProjectRow[];
  return rows.map(mapProjectRow);
}

/**
 * Slug lookup for **public** and **unlisted** only (`private` never returned).
 */
export async function getPublishedProjectBySlugPublic(slug: string): Promise<Project | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .in("visibility", ["public", "unlisted"])
    .maybeSingle();

  if (error) {
    throw supabaseReadError("project by slug (public)", error.message, error.code);
  }

  if (!data) {
    return null;
  }

  return mapProjectRow(data as ProjectRow);
}
