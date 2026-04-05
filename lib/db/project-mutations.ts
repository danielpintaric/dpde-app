import "server-only";

import { mapProjectRow, type ProjectRow } from "@/lib/db/map-supabase-rows";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { AdminProjectUpsert } from "@/types/admin";
import type { Project } from "@/types/project";

function writeError(context: string, message: string, code?: string): Error {
  const codePart = code ? ` [${code}]` : "";
  return new Error(`Supabase ${context} failed:${codePart} ${message}`);
}

function toInsertRow(input: AdminProjectUpsert): Record<string, unknown> {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    description: input.description?.trim() || null,
    visibility: input.visibility,
    sort_order: input.sortOrder,
    category: input.category?.trim() || null,
    year: input.year?.trim() || null,
    location: input.location?.trim() || null,
    layout_type: input.layoutType,
  };
}

function toUpdateRow(input: AdminProjectUpsert): Record<string, unknown> {
  return {
    ...toInsertRow(input),
    updated_at: new Date().toISOString(),
  };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("project by id", error.message, error.code);
  }
  if (!data) {
    return null;
  }
  return mapProjectRow(data as ProjectRow);
}

export async function insertProject(input: AdminProjectUpsert): Promise<Project> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(toInsertRow(input))
    .select("*")
    .single();

  if (error) {
    throw writeError("project insert", error.message, error.code);
  }
  return mapProjectRow(data as ProjectRow);
}

export async function updateProject(
  id: string,
  input: AdminProjectUpsert,
): Promise<Project> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .update(toUpdateRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw writeError("project update", error.message, error.code);
  }
  return mapProjectRow(data as ProjectRow);
}
