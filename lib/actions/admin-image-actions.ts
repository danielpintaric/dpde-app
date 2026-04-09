"use server";

import { redirect } from "next/navigation";
import { revalidatePortfolioSync } from "@/lib/admin/revalidate-portfolio-sync";
import { requireAdminSession } from "@/lib/auth/require-admin-session";
import {
  deleteAdminProjectImage,
  deleteAdminProjectImagesBulk,
  reorderAdminProjectImages,
  setAdminProjectCoverImage,
  updateAdminImageDetails,
  updateAdminImageFocalOnly,
  updateAdminImageSortOrder,
  type AdminImageDetailsInput,
} from "@/lib/services/admin-images";

export type ReorderProjectImagesResult = { ok: true } | { ok: false; error: string };
export type BulkDeleteProjectImagesResult = { ok: true } | { ok: false; error: string };
export type ImageMutationResult = { ok: true } | { ok: false; error: string };

function parseOptionalFocal(raw: unknown): number | null {
  const t = String(raw ?? "").trim();
  if (t === "") {
    return null;
  }
  const n = Number.parseInt(t, 10);
  if (Number.isNaN(n)) {
    return null;
  }
  return Math.max(0, Math.min(100, n));
}

function parseProjectImageDetailsForm(
  formData: FormData,
): { ok: true; projectId: string; imageId: string; projectSlug: string | null; input: AdminImageDetailsInput } | { ok: false; error: string } {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const aspectClass = String(formData.get("aspectClass") ?? "").trim();
  const objectPosition = String(formData.get("objectPosition") ?? "").trim();
  const imageFilterClass = String(formData.get("imageFilterClass") ?? "").trim();
  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = Number.parseInt(sortRaw, 10);
  const focalX = parseOptionalFocal(formData.get("focalX"));
  const focalY = parseOptionalFocal(formData.get("focalY"));
  if (!projectId || !imageId || Number.isNaN(sortOrder)) {
    return { ok: false, error: "Invalid image details form." };
  }
  if ((focalX === null) !== (focalY === null)) {
    return { ok: false, error: "Invalid focal pair." };
  }
  return {
    ok: true,
    projectId,
    imageId,
    projectSlug,
    input: {
      caption: caption || null,
      altText: altText || null,
      aspectClass,
      objectPosition: objectPosition || null,
      focalX,
      focalY,
      imageFilterClass: imageFilterClass || null,
      sortOrder,
    },
  };
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

export async function deleteProjectImagesBulkAction(
  projectId: string,
  projectSlug: string | null,
  imageIds: string[],
): Promise<BulkDeleteProjectImagesResult> {
  await requireAdminSession();
  const pid = String(projectId ?? "").trim();
  const slugRaw = String(projectSlug ?? "").trim();
  const slug = slugRaw || null;
  if (!pid || !Array.isArray(imageIds) || imageIds.length === 0) {
    return { ok: false, error: "Invalid request." };
  }
  try {
    await deleteAdminProjectImagesBulk(pid, imageIds);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed.";
    return { ok: false, error: message };
  }
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
    return { ok: false, error: "Invalid request." };
  }
  try {
    await reorderAdminProjectImages(pid, orderedImageIds);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reorder failed.";
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

export async function setProjectCoverMutation(
  projectId: string,
  projectSlug: string | null,
  imageId: string,
): Promise<ImageMutationResult> {
  await requireAdminSession();
  const pid = String(projectId ?? "").trim();
  const slug = String(projectSlug ?? "").trim() || null;
  const iid = String(imageId ?? "").trim();
  if (!pid || !iid) {
    return { ok: false, error: "Invalid request." };
  }
  try {
    await setAdminProjectCoverImage(pid, iid);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not set cover.";
    return { ok: false, error: message };
  }
}

export async function deleteProjectImageMutation(
  projectId: string,
  projectSlug: string | null,
  imageId: string,
): Promise<ImageMutationResult> {
  await requireAdminSession();
  const pid = String(projectId ?? "").trim();
  const slug = String(projectSlug ?? "").trim() || null;
  const iid = String(imageId ?? "").trim();
  if (!pid || !iid) {
    return { ok: false, error: "Invalid request." };
  }
  try {
    await deleteAdminProjectImage(iid, pid);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed.";
    return { ok: false, error: message };
  }
}

export async function updateImageFocalMutation(
  projectId: string,
  projectSlug: string | null,
  imageId: string,
  focalX: number | null,
  focalY: number | null,
): Promise<ImageMutationResult> {
  await requireAdminSession();
  const pid = String(projectId ?? "").trim();
  const slug = String(projectSlug ?? "").trim() || null;
  const iid = String(imageId ?? "").trim();
  if (!pid || !iid) {
    return { ok: false, error: "Invalid request." };
  }
  if ((focalX === null) !== (focalY === null)) {
    return { ok: false, error: "Invalid focal pair." };
  }
  try {
    await updateAdminImageFocalOnly(pid, iid, focalX, focalY);
    revalidatePortfolioSync(pid, slug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save focal point.";
    return { ok: false, error: message };
  }
}

/**
 * Same persistence as {@link updateProjectImageDetailsAction} but returns a result instead of redirecting.
 * Used for batch navigation (prev/next) without a full page navigation.
 */
export async function updateProjectImageDetailsMutation(formData: FormData): Promise<ImageMutationResult> {
  await requireAdminSession();
  const parsed = parseProjectImageDetailsForm(formData);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  try {
    await updateAdminImageDetails(parsed.projectId, parsed.imageId, parsed.input);
    revalidatePortfolioSync(parsed.projectId, parsed.projectSlug);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save image details.";
    return { ok: false, error: message };
  }
}

export async function updateProjectImageDetailsAction(formData: FormData) {
  await requireAdminSession();
  const parsed = parseProjectImageDetailsForm(formData);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  await updateAdminImageDetails(parsed.projectId, parsed.imageId, parsed.input);
  revalidatePortfolioSync(parsed.projectId, parsed.projectSlug);
  redirect(`/admin/projects/${parsed.projectId}/edit?saved=${encodeURIComponent(parsed.imageId)}`);
}
