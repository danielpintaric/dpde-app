"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import {
  createAdminProject,
  saveAdminProject,
} from "@/lib/services/admin-projects";
import type { AdminProjectUpsert } from "@/types/admin";
import type { GalleryLayoutType, ProjectVisibility } from "@/types/project";

export type AdminProjectFormState = {
  error?: string;
} | null;

function parseUpsert(formData: FormData): AdminProjectUpsert {
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!slug || !title) {
    throw new Error("Title and slug are required.");
  }

  const visibility = String(formData.get("visibility") ?? "public");
  if (visibility !== "public" && visibility !== "private" && visibility !== "unlisted") {
    throw new Error("Invalid visibility.");
  }

  const layoutType = String(formData.get("layoutType") ?? "mixed");
  if (layoutType !== "cinematic" && layoutType !== "grid" && layoutType !== "mixed") {
    throw new Error("Invalid layout type.");
  }

  const sortRaw = String(formData.get("sortOrder") ?? "0");
  const sortOrder = Number.parseInt(sortRaw, 10);
  if (Number.isNaN(sortOrder)) {
    throw new Error("Sort order must be a number.");
  }

  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  return {
    slug,
    title,
    subtitle: subtitle || null,
    description: description || null,
    visibility: visibility as ProjectVisibility,
    sortOrder,
    category: category || null,
    year: year || null,
    location: location || null,
    layoutType: layoutType as GalleryLayoutType,
  };
}

export async function createProjectAction(
  _prev: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  await requireAdminSession();
  try {
    const input = parseUpsert(formData);
    await createAdminProject(input);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed.";
    return { error: message };
  }
  revalidatePath("/admin/projects");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  _prev: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Missing project id." };
  }
  let input: AdminProjectUpsert;
  try {
    input = parseUpsert(formData);
    await saveAdminProject(id, input);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed.";
    return { error: message };
  }
  revalidatePath("/admin/projects");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${input.slug}`);
  revalidatePath("/");
  redirect("/admin/projects");
}
