import "server-only";

import { mapImageRow, mapProjectRow, type ImageRow, type ProjectRow } from "@/lib/db/map-supabase-rows";
import { resolveClientAccessForSelections } from "@/lib/db/client-access-resolve-server";
import { lookupClientAccessByToken } from "@/lib/db/client-access-token";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { PROJECT_IMAGES_BUCKET } from "@/lib/storage/project-image-paths";
import type { Image, Project } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";

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

export type ClientDownloadAuthResult =
  | { ok: true; image: Image; project: Project }
  | { ok: false; status: number; message: string };

export type ClientProjectDownloadAuthResult =
  | { ok: true; project: Project; accessId: string }
  | { ok: false; status: number; message: string };

/**
 * Validates share token + project slug (no image id). Used for selection ZIP and similar.
 */
export async function authorizeClientProjectForDownload(
  token: string,
  projectSlug: string,
): Promise<ClientProjectDownloadAuthResult> {
  const rawToken = token.trim();
  const slug = projectSlug.trim();

  if (!rawToken || !slug) {
    return { ok: false, status: 400, message: "Invalid request." };
  }

  if (!getOptionalSupabaseServiceRoleKey()) {
    return { ok: false, status: 503, message: "Downloads are temporarily unavailable." };
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
    return { ok: false, status: 503, message: "Downloads are temporarily unavailable." };
  }

  const { data: projectRow, error: projectErr } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (projectErr) {
    return { ok: false, status: 400, message: "Could not verify project." };
  }
  if (!projectRow) {
    return { ok: false, status: 404, message: "Project not found." };
  }

  const project = mapProjectRow(projectRow as ProjectRow);
  if (!allowed.has(project.id)) {
    return { ok: false, status: 403, message: "This project is not included in your access." };
  }

  const resolved = await resolveClientAccessForSelections(rawToken, lookup);
  if (!resolved) {
    return { ok: false, status: 503, message: "Downloads are temporarily unavailable." };
  }

  return { ok: true, project, accessId: resolved.accessId };
}

/**
 * Validates share token + project slug + image id before streaming from storage.
 */
export async function authorizeClientImageDownload(
  token: string,
  projectSlug: string,
  imageId: string,
): Promise<ClientDownloadAuthResult> {
  const rawToken = token.trim();
  const slug = projectSlug.trim();
  const imgId = imageId.trim();

  if (!rawToken || !slug || !imgId) {
    return { ok: false, status: 400, message: "Invalid request." };
  }

  if (!getOptionalSupabaseServiceRoleKey()) {
    return { ok: false, status: 503, message: "Downloads are temporarily unavailable." };
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
    return { ok: false, status: 503, message: "Downloads are temporarily unavailable." };
  }

  const { data: projectRow, error: projectErr } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (projectErr) {
    return { ok: false, status: 400, message: "Could not verify project." };
  }
  if (!projectRow) {
    return { ok: false, status: 404, message: "Project not found." };
  }

  const project = mapProjectRow(projectRow as ProjectRow);
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

  if (image.externalUrl?.trim()) {
    return { ok: false, status: 404, message: "Download not available for this image." };
  }

  const path = image.storagePath?.trim();
  if (!path) {
    return { ok: false, status: 404, message: "File not available." };
  }

  return { ok: true, image, project };
}

export function downloadFilenameForClientImage(projectSlug: string, image: Image): string {
  const rawLeaf = image.filename?.trim().split(/[/\\]/).pop() || "image.jpg";
  const leaf = rawLeaf.replace(/[^\w.\-]+/g, "_").slice(0, 96) || "image.jpg";
  const safeSlug = projectSlug.replace(/[^\w.\-]+/g, "_").slice(0, 64) || "project";
  return `${safeSlug}--${leaf}`;
}

/** Load file from bucket after authorization (service role). */
export async function loadStorageObjectForDownload(storagePath: string): Promise<
  | { ok: true; blob: Blob }
  | { ok: false }
> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).download(storagePath);
    if (error || !data) {
      return { ok: false };
    }
    return { ok: true, blob: data };
  } catch {
    return { ok: false };
  }
}
