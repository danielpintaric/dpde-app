import "server-only";

import {
  DEFAULT_UPLOAD_ASPECT_CLASS,
  deleteImageRow,
  getImageById,
  getNextImageSortOrder,
  insertUploadedImageRow,
  setProjectCoverImageId,
  updateImageMetadataDb,
  updateImageSortOrderDb,
} from "@/lib/db/image-mutations";
import { listImagesByProjectId } from "@/lib/db/images";
import { getProjectById } from "@/lib/db/project-mutations";
import { getProjectImagePublicUrl } from "@/lib/storage/project-image-public-url";
import {
  removeObjectFromProjectBucketIfPresent,
  shouldRemoveObjectFromBucket,
  uploadOriginalToProjectBucket,
} from "@/lib/storage/project-storage";
import type { Image } from "@/types/project";

export async function listAdminProjectImages(projectId: string): Promise<Image[]> {
  return listImagesByProjectId(projectId);
}

export function adminImagePreviewUrl(image: Image): string {
  const external = image.externalUrl?.trim();
  if (external) {
    return external;
  }
  return getProjectImagePublicUrl(image.storagePath);
}

export async function uploadFilesToProject(
  projectId: string,
  files: File[],
): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  let sortOrder = await getNextImageSortOrder(projectId);
  for (const file of files) {
    if (!file || file.size === 0) {
      continue;
    }
    const { storagePath, storedFilename } = await uploadOriginalToProjectBucket(
      projectId,
      file,
    );
    await insertUploadedImageRow({
      projectId,
      storagePath,
      filename: storedFilename,
      sortOrder,
    });
    sortOrder += 1;
  }
}

export async function deleteAdminProjectImage(
  imageId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.coverImageId === imageId) {
    await setProjectCoverImageId(projectId, null);
  }

  const removed = await deleteImageRow(imageId, projectId);
  if (!removed) {
    throw new Error("Image not found for this project.");
  }

  if (shouldRemoveObjectFromBucket(removed)) {
    try {
      await removeObjectFromProjectBucketIfPresent(removed.storagePath);
    } catch (e) {
      console.warn("[admin] Storage object delete skipped or failed:", e);
    }
  }
}

export async function setAdminProjectCoverImage(
  projectId: string,
  imageId: string,
): Promise<void> {
  const image = await getImageById(imageId);
  if (!image || image.projectId !== projectId) {
    throw new Error("Image not found for this project.");
  }
  await setProjectCoverImageId(projectId, imageId);
}

export async function updateAdminImageSortOrder(
  projectId: string,
  imageId: string,
  sortOrder: number,
): Promise<void> {
  const image = await getImageById(imageId);
  if (!image || image.projectId !== projectId) {
    throw new Error("Image not found for this project.");
  }
  if (!Number.isFinite(sortOrder)) {
    throw new Error("Invalid sort order.");
  }
  await updateImageSortOrderDb(imageId, projectId, Math.trunc(sortOrder));
}

export type AdminImageDetailsInput = {
  caption: string | null;
  altText: string | null;
  aspectClass: string;
  objectPosition: string | null;
  sortOrder: number;
};

export async function updateAdminImageDetails(
  projectId: string,
  imageId: string,
  input: AdminImageDetailsInput,
): Promise<void> {
  const image = await getImageById(imageId);
  if (!image || image.projectId !== projectId) {
    throw new Error("Image not found for this project.");
  }
  if (!Number.isFinite(input.sortOrder)) {
    throw new Error("Invalid sort order.");
  }
  const aspect =
    input.aspectClass.trim() || image.aspectClass?.trim() || DEFAULT_UPLOAD_ASPECT_CLASS;
  await updateImageMetadataDb(imageId, projectId, {
    caption: input.caption,
    altText: input.altText,
    aspectClass: aspect,
    objectPosition: input.objectPosition,
    sortOrder: Math.trunc(input.sortOrder),
  });
}
