import "server-only";

import {
  getProjectById,
  insertProject,
  updateProject,
} from "@/lib/db/project-mutations";
import { listProjects } from "@/lib/db/projects";
import type { AdminProjectUpsert } from "@/types/admin";
import type { Project } from "@/types/project";

/** All projects (any visibility), ordered for admin. */
export async function listAdminProjects(): Promise<Project[]> {
  return listProjects();
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
