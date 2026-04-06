import "server-only";

import {
  getProjectById,
  insertProject,
  updateProject,
} from "@/lib/db/project-mutations";
import { listImagesByProjectIds } from "@/lib/db/images";
import { listProjects } from "@/lib/db/projects";
import type { AdminProjectListEntry, AdminProjectUpsert } from "@/types/admin";
import type { Image, Project } from "@/types/project";

/** All projects (any visibility), ordered for admin. */
export async function listAdminProjects(): Promise<Project[]> {
  return listProjects();
}

function pickCoverImage(project: Project, images: Image[]): Image | null {
  if (images.length === 0) {
    return null;
  }
  if (project.coverImageId) {
    const cover = images.find((i) => i.id === project.coverImageId);
    if (cover) {
      return cover;
    }
  }
  return images[0] ?? null;
}

/** Projects plus image counts and cover thumbnail (explicit cover or first in gallery order). */
export async function listAdminProjectsWithSummary(): Promise<AdminProjectListEntry[]> {
  const projects = await listProjects();
  if (projects.length === 0) {
    return [];
  }
  const projectIds = projects.map((p) => p.id);
  const flatImages = await listImagesByProjectIds(projectIds);
  const byProject = new Map<string, Image[]>();
  for (const img of flatImages) {
    const list = byProject.get(img.projectId);
    if (list) {
      list.push(img);
    } else {
      byProject.set(img.projectId, [img]);
    }
  }
  return projects.map((project) => {
    const images = byProject.get(project.id) ?? [];
    return {
      project,
      imageCount: images.length,
      coverImage: pickCoverImage(project, images),
    };
  });
}

export async function getAdminProjectById(id: string): Promise<Project | null> {
  return getProjectById(id);
}

export async function createAdminProject(
  input: AdminProjectUpsert,
): Promise<Project> {
  return insertProject(input);
}

export async function saveAdminProject(
  id: string,
  input: AdminProjectUpsert,
): Promise<Project> {
  return updateProject(id, input);
}
