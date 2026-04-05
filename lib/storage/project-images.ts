import "server-only";

import {
  PROJECT_IMAGES_BUCKET,
  projectImageOriginalObjectPath,
} from "@/lib/storage/project-image-paths";
import { uploadOriginalToProjectBucket } from "@/lib/storage/project-storage";

export type UploadProjectImageParams = {
  projectId: string;
  filename: string;
  file: File;
};

export function resolveProjectImageUploadTarget(
  projectId: string,
  filename: string,
): { bucket: typeof PROJECT_IMAGES_BUCKET; path: string } {
  return {
    bucket: PROJECT_IMAGES_BUCKET,
    path: projectImageOriginalObjectPath(projectId, filename),
  };
}

/** Uploads one file to `project-images` at V1 path; use `admin-images` + DB insert for full flow. */
export async function uploadProjectImage(
  params: UploadProjectImageParams,
): Promise<{ bucket: string; path: string }> {
  const { storagePath } = await uploadOriginalToProjectBucket(
    params.projectId,
    params.file,
  );
  return { bucket: PROJECT_IMAGES_BUCKET, path: storagePath };
}
