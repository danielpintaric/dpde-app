import "server-only";

import {
  mapImageRow,
  mapProjectRow,
  type ImageRow,
  type ProjectRow,
} from "@/lib/db/map-supabase-rows";
import { resolveClientAccessForSelections } from "@/lib/db/client-access-resolve-server";
import { lookupClientAccessByToken } from "@/lib/db/client-access-token";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getOptionalSupabaseServiceRoleKey } from "@/lib/db/supabase-server-env";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import type { PortfolioProject } from "@/lib/portfolio-data";
import {
  listSelectionImageIdsForAccess,
  countSelectionsForAccess,
} from "@/lib/db/client-image-selections";
import { mapDbProjectToPortfolioProject } from "@/lib/services/portfolio-project-mapper";
import type { Image, Project } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientTokenAreaState =
  | { kind: "missing_token" }
  | { kind: "invalid_link" }
  | { kind: "expired" }
  | { kind: "ok"; clientName: string | null; projects: PortfolioProject[]; selectionCountTotal: number };

/** `/client/[slug]?token=…` — detail view within a share. */
export type ClientTokenDetailState =
  | { kind: "missing_token" }
  | { kind: "invalid_link" }
  | { kind: "expired" }
  | { kind: "not_found" }
  | { kind: "not_in_share" }
  | { kind: "incomplete" }
  | {
      kind: "ok";
      project: PortfolioProject;
      prev: PortfolioProject | null;
      next: PortfolioProject | null;
      /** Image ids in this project that are selected for this access (persisted). */
      selectedImageIds: string[];
    };

function compareImagesByGalleryOrder(a: Image, b: Image): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }
  return a.createdAt.localeCompare(b.createdAt);
}

async function getElevatedSupabaseForClientAccess(): Promise<SupabaseClient> {
  if (getOptionalSupabaseServiceRoleKey()) {
    try {
      return createSupabaseServiceRoleClient();
    } catch {
      // Misconfigured key — fall back to server client (works when RLS allows).
    }
  }
  return await createSupabaseServerClient();
}

async function listImagesByProjectIdsForClientAccess(
  supabase: SupabaseClient,
  projectIds: string[],
): Promise<Image[]> {
  if (projectIds.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .in("project_id", projectIds);

  if (error) {
    throw supabaseReadError("images list (client access)", error.message, error.code);
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

async function loadPortfolioProjectsOrdered(
  supabase: SupabaseClient,
  orderedIds: string[],
): Promise<PortfolioProject[]> {
  const uniqueOrdered: string[] = [];
  const seen = new Set<string>();
  for (const id of orderedIds) {
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    uniqueOrdered.push(id);
  }
  if (uniqueOrdered.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from("projects").select("*").in("id", uniqueOrdered);

  if (error) {
    throw supabaseReadError("projects by ids (client access)", error.message, error.code);
  }

  const rows = (data ?? []) as ProjectRow[];
  const byId = new Map<string, Project>();
  for (const row of rows) {
    byId.set(row.id, mapProjectRow(row));
  }

  const allImages = await listImagesByProjectIdsForClientAccess(supabase, uniqueOrdered);
  const imagesByProject = new Map<string, Image[]>();
  for (const img of allImages) {
    const list = imagesByProject.get(img.projectId) ?? [];
    list.push(img);
    imagesByProject.set(img.projectId, list);
  }

  const out: PortfolioProject[] = [];
  for (const id of uniqueOrdered) {
    const project = byId.get(id);
    if (!project) {
      continue;
    }
    const images = imagesByProject.get(id) ?? [];
    if (images.length === 0) {
      continue;
    }
    try {
      out.push(mapDbProjectToPortfolioProject(project, images));
    } catch {
      continue;
    }
  }

  return out;
}

/**
 * Resolves `/client?token=…`: token lookup + ordered shared projects (skips missing or incomplete rows).
 */
export async function resolveClientTokenArea(token: string | undefined): Promise<ClientTokenAreaState> {
  const raw = token?.trim() ?? "";
  if (raw.length === 0) {
    return { kind: "missing_token" };
  }

  try {
    const lookup = await lookupClientAccessByToken(raw);
    if (lookup.status === "expired") {
      return { kind: "expired" };
    }
    if (lookup.status !== "ok") {
      return { kind: "invalid_link" };
    }

    const supabase = await getElevatedSupabaseForClientAccess();
    const projects = await loadPortfolioProjectsOrdered(supabase, lookup.projectIds);
    const resolved = await resolveClientAccessForSelections(raw, lookup);
    const selectionCountTotal = resolved
      ? await countSelectionsForAccess(resolved.accessId)
      : 0;
    return { kind: "ok", clientName: lookup.clientName, projects, selectionCountTotal };
  } catch (e) {
    console.error("resolveClientTokenArea:", e);
    return { kind: "invalid_link" };
  }
}

/**
 * Resolves `/client/[slug]?token=…`: same token rules as the listing; slug must be in `project_ids`.
 */
export async function resolveClientTokenDetail(
  slug: string,
  token: string | undefined,
): Promise<ClientTokenDetailState> {
  const raw = token?.trim() ?? "";
  if (raw.length === 0) {
    return { kind: "missing_token" };
  }

  const trimmedSlug = String(slug ?? "").trim();
  if (!trimmedSlug) {
    return { kind: "not_found" };
  }

  try {
    const lookup = await lookupClientAccessByToken(raw);
    if (lookup.status === "expired") {
      return { kind: "expired" };
    }
    if (lookup.status !== "ok") {
      return { kind: "invalid_link" };
    }

    const allowedIds = new Set(lookup.projectIds);
    if (allowedIds.size === 0) {
      return { kind: "not_in_share" };
    }

    const supabase = await getElevatedSupabaseForClientAccess();
    const { data: row, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", trimmedSlug)
      .maybeSingle();

    if (error) {
      console.error("resolveClientTokenDetail projects:", error.message);
      return { kind: "invalid_link" };
    }

    if (!row) {
      return { kind: "not_found" };
    }

    const projectRow = row as ProjectRow;
    if (!allowedIds.has(projectRow.id)) {
      return { kind: "not_in_share" };
    }

    const images = await listImagesByProjectIdsForClientAccess(supabase, [projectRow.id]);
    if (images.length === 0) {
      return { kind: "incomplete" };
    }

    const project = mapProjectRow(projectRow);
    let portfolio: PortfolioProject;
    try {
      portfolio = mapDbProjectToPortfolioProject(project, images);
    } catch {
      return { kind: "incomplete" };
    }

    const ordered = await loadPortfolioProjectsOrdered(supabase, lookup.projectIds);
    const idx = ordered.findIndex((p) => p.slug === trimmedSlug);
    const prev = idx > 0 ? ordered[idx - 1]! : null;
    const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1]! : null;

    const projectImageIds = new Set<string>();
    for (const im of portfolio.images) {
      if (im.imageId) {
        projectImageIds.add(im.imageId);
      }
    }
    const resolved = await resolveClientAccessForSelections(raw, lookup);
    const allSelected = resolved
      ? await listSelectionImageIdsForAccess(resolved.accessId)
      : [];
    const selectedImageIds = allSelected.filter((id) => projectImageIds.has(id));

    return { kind: "ok", project: portfolio, prev, next, selectedImageIds };
  } catch (e) {
    console.error("resolveClientTokenDetail:", e);
    return { kind: "invalid_link" };
  }
}
