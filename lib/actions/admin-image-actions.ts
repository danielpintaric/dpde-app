"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import {
  deleteAdminProjectImage,
  setAdminProjectCoverImage,
  updateAdminImageDetails,
  updateAdminImageSortOrder,
  uploadFilesToProject,
} from "@/lib/services/admin-images";

export type AdminImageUploadState = { error?: string } | null;

function revalidatePortfolioSync(projectId: string, projectSlug: string | null) {
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/portfolio");
  revalidatePath("/");
  if (projectSlug) {
    revalidatePath(`/portfolio/${projectSlug}`);
    revalidatePath(`/client/${projectSlug}`);
  }
}

export async function uploadProjectImagesAction(
  _prev: AdminImageUploadState,
  formData: FormData,
): Promise<AdminImageUploadState> {
  await requireAdminSession();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  if (!projectId) {
    return { error: "Missing project." };
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { error: "No files selected." };
  }

  try {
    await uploadFilesToProject(projectId, files);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return { error: message };
  }

  revalidatePortfolioSync(projectId, projectSlug);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function deleteProjectImageAction(formData: FormData) {
  await requireAdminSession();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  if (!projectId || !imageId) {
    throw new Error("Missing project or image.");
  }
  await deleteAdminProjectImage(imageId, projectId);
  revalidatePortfolioSync(projectId, projectSlug);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function setProjectCoverImageAction(formData: FormData) {
  await requireAdminSession();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  if (!projectId || !imageId) {
    throw new Error("Missing project or image.");
  }
  await setAdminProjectCoverImage(projectId, imageId);
  revalidatePortfolioSync(projectId, projectSlug);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function updateImageSortOrderAction(formData: FormData) {
  await requireAdminSession();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  const raw = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = Number.parseInt(raw, 10);
  if (!projectId || !imageId || Number.isNaN(sortOrder)) {
    throw new Error("Invalid sort order form.");
  }
  await updateAdminImageSortOrder(projectId, imageId, sortOrder);
  revalidatePortfolioSync(projectId, projectSlug);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function updateProjectImageDetailsAction(formData: FormData) {
  await requireAdminSession();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const aspectClass = String(formData.get("aspectClass") ?? "").trim();
  const objectPosition = String(formData.get("objectPosition") ?? "").trim();
  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = Number.parseInt(sortRaw, 10);
  if (!projectId || !imageId || Number.isNaN(sortOrder)) {
    throw new Error("Invalid image details form.");
  }
  await updateAdminImageDetails(projectId, imageId, {
    caption: caption || null,
    altText: altText || null,
    aspectClass,
    objectPosition: objectPosition || null,
    sortOrder,
  });
  revalidatePortfolioSync(projectId, projectSlug);
  redirect(`/admin/projects/${projectId}/edit?saved=${encodeURIComponent(imageId)}`);
}
