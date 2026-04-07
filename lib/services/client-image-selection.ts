import "server-only";

import { mapImageRow, mapProjectRow, type ImageRow, type ProjectRow } from "@/lib/db/map-supabase-rows";
import { resolveClientAccessForSelections } from "@/lib/db/client-access-resolve-server";
import { lookupClientAccessByToken } from "@/lib/db/client-access-token";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import type { Project } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function looksLikeProjectUuid(ref: string): boolean {
  return UUID_RE.test(ref.trim());
}

async function getElevatedSupabaseForClientAccess(): Promise<SupabaseClient | null> {
  if (getOptionalSupabaseServiceRoleKey()) {
    try {
      return createSupabaseServiceRoleClient();
    } catch {
      // fall through
    }
  }
  return await createSupabaseServerClient();
}

async function resolveProjectByRef(
  supabase: SupabaseClient,
  projectRef: string,
): Promise<Project | null> {
  const ref = projectRef.trim();
  if (!ref) {
    return null;
  }
  const q = looksLikeProjectUuid(ref)
    ? supabase.from("projects").select("*").eq("id", ref).maybeSingle()
    : supabase.from("projects").select("*").eq("slug", ref).maybeSingle();

  const { data, error } = await q;
  if (error || !data) {
    return null;
  }
  return mapProjectRow(data as ProjectRow);
}

export type ClientSelectionMutationResult =
  | { ok: true; selected: boolean }
  | { ok: false; status: number; message: string };

/**
 * Validates token + project ref + image, then inserts/deletes selection rows (service role).
 */
export async function mutateClientImageSelection(
  token: string,
  projectRef: string,
  imageId: string,
  action: "toggle" | "select" | "unselect",
): Promise<ClientSelectionMutationResult> {
  const rawToken = token.trim();
  const imgId = imageId.trim();

  if (!rawToken || !projectRef.trim() || !imgId) {
    return { ok: false, status: 400, message: "Invalid request." };
  }

  if (!getOptionalSupabaseServiceRoleKey()) {
    return { ok: false, status: 503, message: "Selection is temporarily unavailable." };
  }

  const lookup = await lookupClientAccessByToken(rawToken);
  if (lookup.status === "expired") {
    return { ok: false, status: 403, message: "This access link has expired." };
  }
  if (lookup.status !== "ok") {
    return { ok: false, status: 403, message: "Access denied." };
  }

  const allowed = new Set(lookup.projectIds);
  if (allowed.size === 0) {
    return { ok: false, status: 403, message: "Access denied." };
  }

  const supabase = await getElevatedSupabaseForClientAccess();
  if (!supabase) {
    return { ok: false, status: 503, message: "Selection is temporarily unavailable." };
  }

  const project = await resolveProjectByRef(supabase, projectRef);
  if (!project) {
    return { ok: false, status: 404, message: "Project not found." };
  }

  if (!allowed.has(project.id)) {
    return { ok: false, status: 403, message: "This project is not included in your access." };
  }

  const { data: imageRow, error: imageErr } = await supabase
    .from("images")
    .select("*")
    .eq("id", imgId)
    .maybeSingle();

  if (imageErr) {
    return { ok: false, status: 400, message: "Could not verify image." };
  }
  if (!imageRow) {
    return { ok: false, status: 404, message: "Image not found." };
  }

  const image = mapImageRow(imageRow as ImageRow);
  if (image.projectId !== project.id) {
    return { ok: false, status: 403, message: "Access denied." };
  }

  const resolved = await resolveClientAccessForSelections(rawToken, lookup);
  if (!resolved) {
    return { ok: false, status: 503, message: "Selection is temporarily unavailable." };
  }
  const { accessId, siteId } = resolved;

  const service = createSupabaseServiceRoleClient();

  const { data: existing, error: exErr } = await service
    .from("client_image_selections")
    .select("id")
    .eq("client_access_id", accessId)
    .eq("image_id", imgId)
    .maybeSingle();

  if (exErr) {
    return { ok: false, status: 400, message: "Could not update selection." };
  }

  const hasRow = Boolean(existing);

  const doDelete = async (): Promise<ClientSelectionMutationResult> => {
    const { error } = await service
      .from("client_image_selections")
      .delete()
      .eq("client_access_id", accessId)
      .eq("image_id", imgId);
    if (error) {
      return { ok: false, status: 400, message: "Could not update selection." };
    }
    return { ok: true, selected: false };
  };

  const doInsert = async (): Promise<ClientSelectionMutationResult> => {
    const { error } = await service.from("client_image_selections").insert({
      site_id: siteId,
      client_access_id: accessId,
      project_id: project.id,
      image_id: imgId,
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: true, selected: true };
      }
      return { ok: false, status: 400, message: "Could not update selection." };
    }
    return { ok: true, selected: true };
  };

  if (action === "select") {
    if (hasRow) {
      return { ok: true, selected: true };
    }
    return doInsert();
  }

  if (action === "unselect") {
    if (!hasRow) {
      return { ok: true, selected: false };
    }
    return doDelete();
  }

  // toggle
  if (hasRow) {
    return doDelete();
  }
  return doInsert();
}
