import "server-only";

import { listImagesByProjectId } from "@/lib/db/images";
import { getProjectBySlug, listProjects } from "@/lib/db/projects";
import { getProjectImagePublicUrl } from "@/lib/storage/project-image-public-url";
import type { Image, Project } from "@/types/project";

/**
 * Public portfolio visibility (V1):
 *
 * - **`public`** — in {@link getCatalogProjects} (e.g. /portfolio grid, sitemap), and by slug.
 * - **`unlisted`** — **not** in catalog listing; **yes** by slug at `/portfolio/[slug]` (shareable URL).
 * - **`private`** — **never** here or on public routes; `/client` only when logged in (see client-portfolio-data).
 */
export async function getCatalogProjects(): Promise<Project[]> {
  const rows = await listProjects();
  return rows.filter((p) => p.visibility === "public");
}

/** Resolves project for public detail: `public` and `unlisted` only. */
export async function getCatalogProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const project = await getProjectBySlug(slug);
  if (!project) {
    return null;
  }
  if (project.visibility === "private") {
    return null;
  }
  return project;
}

/** Public URL for a catalog image row (see `getProjectImagePublicUrl` for bucket requirements). */
export function getCatalogImagePublicUrl(image: Image): string {
  return getProjectImagePublicUrl(image.storagePath);
}

export async function getCatalogProjectImages(
  projectId: string,
): Promise<Image[]> {
  return listImagesByProjectId(projectId);
}
