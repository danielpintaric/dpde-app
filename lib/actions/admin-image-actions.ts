"use server";

import { redirect } from "next/navigation";
import { revalidatePortfolioSync } from "@/lib/admin/revalidate-portfolio-sync";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import {
  deleteAdminProjectImage,
  reorderAdminProjectImages,
  setAdminProjectCoverImage,
  updateAdminImageDetails,
  updateAdminImageSortOrder,
} from "@/lib/services/admin-images";

export type ReorderProjectImagesResult = { ok: true } | { ok: false; error: string };

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

export async function reorderProjectImagesAction(
  projectId: string,
  projectSlug: string | null,
  orderedImageIds: string[],
): Promise<ReorderProjectImagesResult> {
  await requireAdminSession();
  const pid = String(projectId ?? "").trim();
  const slugRaw = String(projectSlug ?? "").trim();
  const slug = slugRaw || null;
  if (!pid || !Array.isArray(orderedImageIds) || orderedImageIds.length === 0) {
    return { ok: false, error: "Ungültige Daten." };
  }
  try {
    await reorderAdminProjectImages(pid, orderedImageIds);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sortierung fehlgeschlagen.";
    return { ok: false, error: message };
  }
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
