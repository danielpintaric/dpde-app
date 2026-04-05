import "server-only";

import { getSupabasePublicConfig } from "@/lib/db/supabase-env";
import { listImagesByProjectId } from "@/lib/db/images";
import { getProjectBySlug, listProjects } from "@/lib/db/projects";
import type { PortfolioProject } from "@/lib/portfolio-data";
import { mapDbProjectToPortfolioProject } from "@/lib/services/portfolio-project-mapper";
import type { Project } from "@/types/project";

/**
 * V1 client workspace: **`private` only**.
 * **`unlisted`** stays off the public index but is reachable at `/portfolio/[slug]` via direct link only
 * (not listed under `/client`).
 */
function isClientVisible(project: Project): boolean {
  return project.visibility === "private";
}

function clientSupabaseConfigured(): boolean {
  try {
    getSupabasePublicConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Private projects only (V1: any signed-in user). Order matches DB list.
 */
export async function listClientVisibleDbProjects(): Promise<Project[]> {
  if (!clientSupabaseConfigured()) {
    return [];
  }
  const rows = await listProjects();
  return rows.filter(isClientVisible);
}

export async function loadClientWorkspaceProjects(): Promise<PortfolioProject[]> {
  const projects = await listClientVisibleDbProjects();
  const out: PortfolioProject[] = [];
  for (const p of projects) {
    try {
      const images = await listImagesByProjectId(p.id);
      if (images.length === 0) {
        continue;
      }
      out.push(mapDbProjectToPortfolioProject(p, images));
    } catch {
      continue;
    }
  }
  return out;
}

/**
 * Client detail: **`private` only**. Use `/portfolio/[slug]` for public and unlisted (direct link).
 */
export async function loadClientProjectBySlug(
  slug: string,
): Promise<PortfolioProject | null> {
  if (!clientSupabaseConfigured()) {
    return null;
  }
  const project = await getProjectBySlug(slug);
  if (!project || !isClientVisible(project)) {
    return null;
  }
  const images = await listImagesByProjectId(project.id);
  if (images.length === 0) {
    return null;
  }
  try {
    return mapDbProjectToPortfolioProject(project, images);
  } catch {
    return null;
  }
}

export async function loadClientAdjacentProjects(slug: string): Promise<{
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
}> {
  const list = await loadClientWorkspaceProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: i > 0 ? list[i - 1]! : null,
    next: i < list.length - 1 ? list[i + 1]! : null,
  };
}
