import "server-only";

import { mapImageRow, type ImageRow } from "@/lib/db/map-supabase-rows";
import { supabaseReadError } from "@/lib/db/supabase-read-error";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Image } from "@/types/project";

function writeError(context: string, message: string, code?: string): Error {
  const codePart = code ? ` [${code}]` : "";
  return new Error(`Supabase ${context} failed:${codePart} ${message}`);
}

/** Default gallery layout for newly uploaded files until per-image editing exists. */
export const DEFAULT_UPLOAD_ASPECT_CLASS = "aspect-[4/5] sm:aspect-[16/10]";

export async function getImageById(id: string): Promise<Image | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("image by id", error.message, error.code);
  }
  if (!data) {
    return null;
  }
  return mapImageRow(data as ImageRow);
}

export async function getNextImageSortOrder(projectId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw supabaseReadError("image sort max", error.message, error.code);
  }
  const row = data as { sort_order: number } | null;
  if (!row) {
    return 0;
  }
  return row.sort_order + 1;
}

export async function insertUploadedImageRow(input: {
  projectId: string;
  storagePath: string;
  filename: string;
  sortOrder: number;
}): Promise<Image> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .insert({
      project_id: input.projectId,
      storage_path: input.storagePath,
      filename: input.filename,
      alt_text: null,
      caption: null,
      width: null,
      height: null,
      sort_order: input.sortOrder,
      external_url: null,
      aspect_class: DEFAULT_UPLOAD_ASPECT_CLASS,
      object_position: null,
    })
    .select("*")
    .single();

  if (error) {
    throw writeError("image insert", error.message, error.code);
  }
  return mapImageRow(data as ImageRow);
}

export async function updateImageSortOrderDb(
  imageId: string,
  projectId: string,
  sortOrder: number,
): Promise<Image> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .update({ sort_order: sortOrder })
    .eq("id", imageId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error) {
    throw writeError("image sort update", error.message, error.code);
  }
  return mapImageRow(data as ImageRow);
}

export async function updateImageMetadataDb(
  imageId: string,
  projectId: string,
  input: {
    caption: string | null;
    altText: string | null;
    aspectClass: string;
    objectPosition: string | null;
    sortOrder: number;
  },
): Promise<Image> {
  const aspect = input.aspectClass.trim() || DEFAULT_UPLOAD_ASPECT_CLASS;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .update({
      caption: input.caption,
      alt_text: input.altText,
      aspect_class: aspect,
      object_position: input.objectPosition,
      sort_order: input.sortOrder,
    })
    .eq("id", imageId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error) {
    throw writeError("image metadata update", error.message, error.code);
  }
  return mapImageRow(data as ImageRow);
}

export async function deleteImageRow(
  imageId: string,
  projectId: string,
): Promise<Image | null> {
  const image = await getImageById(imageId);
  if (!image || image.projectId !== projectId) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("images").delete().eq("id", imageId);

  if (error) {
    throw writeError("image delete", error.message, error.code);
  }
  return image;
}

export async function setProjectCoverImageId(
  projectId: string,
  coverImageId: string | null,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({
      cover_image_id: coverImageId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    throw writeError("project cover update", error.message, error.code);
  }
}
