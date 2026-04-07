import "server-only";

import archiver from "archiver";
import { PassThrough } from "node:stream";
import { Readable } from "node:stream";
import { createSupabaseServiceRoleClient } from "@/lib/db/supabase-service-role";
import { mapImageRow, type ImageRow } from "@/lib/db/map-supabase-rows";
import { PROJECT_IMAGES_BUCKET } from "@/lib/storage/project-image-paths";
import type { Image } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authorizeClientProjectForDownload,
  downloadFilenameForClientImage,
} from "@/lib/services/client-image-download";

export type BuildClientSelectionZipResult =
  | { ok: true; stream: ReadableStream<Uint8Array>; filename: string }
  | { ok: false; status: number; message: string };

function asciiZipEntryName(name: string): string {
  return name.replace(/[^\x20-\x7E]+/g, "_").slice(0, 180) || "file.bin";
}

function selectionZipFilename(projectSlug: string): string {
  const safe = projectSlug.replace(/[^\w.\-]+/g, "_").slice(0, 64) || "project";
  return `${safe}-selection.zip`;
}

type ZipPart = { name: string; buffer: Buffer };

/**
 * Loads bytes from storage for each image (skips failures). Used so we only open the ZIP stream when at least one file exists.
 */
async function collectZipParts(
  images: Image[],
  projectSlug: string,
  supabase: SupabaseClient,
): Promise<ZipPart[]> {
  const usedNames = new Set<string>();
  const parts: ZipPart[] = [];

  for (const image of images) {
    if (image.externalUrl?.trim()) {
      continue;
    }
    const path = image.storagePath?.trim();
    if (!path) {
      continue;
    }
    const { data, error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).download(path);
    if (error || !data) {
      continue;
    }
    const buf = Buffer.from(await data.arrayBuffer());
    let base = downloadFilenameForClientImage(projectSlug, image);
    base = asciiZipEntryName(base);
    let entryName = base;
    let n = 1;
    while (usedNames.has(entryName)) {
      const dot = base.lastIndexOf(".");
      entryName =
        dot > 0 ? `${base.slice(0, dot)}_${n}${base.slice(dot)}` : `${base}_${n}`;
      n += 1;
    }
    usedNames.add(entryName);
    parts.push({ name: entryName, buffer: buf });
  }

  return parts;
}

/**
 * Packs preloaded parts into a ZIP stream (no temp files; archive streams to the HTTP response).
 */
function createZipStreamFromParts(parts: ZipPart[]): ReadableStream<Uint8Array> {
  const archive = archiver("zip", { zlib: { level: 5 } });
  const passThrough = new PassThrough();

  archive.on("error", (err: Error) => {
    passThrough.destroy(err);
  });
  archive.pipe(passThrough);

  void (async () => {
    try {
      for (const p of parts) {
        archive.append(p.buffer, { name: p.name });
      }
      await archive.finalize();
    } catch (err) {
      passThrough.destroy(err instanceof Error ? err : new Error("ZIP failed"));
    }
  })();

  return Readable.toWeb(passThrough) as ReadableStream<Uint8Array>;
}

/**
 * Builds a ZIP stream from images (MVP: storage-backed rows only; skips failed downloads inside collectZipParts).
 */
export async function createZipFromImages(
  images: Image[],
  projectSlug: string,
  supabase: SupabaseClient,
): Promise<ReadableStream<Uint8Array>> {
  const parts = await collectZipParts(images, projectSlug, supabase);
  return createZipStreamFromParts(parts);
}

export async function buildClientSelectionZip(params: {
  token: string;
  projectSlug: string;
}): Promise<BuildClientSelectionZipResult> {
  const { token, projectSlug } = params;
  const auth = await authorizeClientProjectForDownload(token, projectSlug);
  if (!auth.ok) {
    return { ok: false, status: auth.status, message: auth.message };
  }

  const { project, accessId } = auth;
  const supabase = createSupabaseServiceRoleClient();

  const { data: selRows, error: selErr } = await supabase
    .from("client_image_selections")
    .select("image_id, created_at")
    .eq("client_access_id", accessId)
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  if (selErr) {
    return { ok: false, status: 400, message: "Could not load selection." };
  }

  const orderedIds: string[] = [];
  for (const row of selRows ?? []) {
    const id = typeof (row as { image_id?: string }).image_id === "string"
      ? (row as { image_id: string }).image_id.trim()
      : "";
    if (id) {
      orderedIds.push(id);
    }
  }

  if (orderedIds.length === 0) {
    return { ok: false, status: 400, message: "No images selected." };
  }

  const { data: imageRows, error: imgErr } = await supabase
    .from("images")
    .select("*")
    .in("id", orderedIds)
    .eq("project_id", project.id);

  if (imgErr) {
    return { ok: false, status: 400, message: "Could not load images." };
  }

  const byId = new Map<string, Image>();
  for (const row of imageRows ?? []) {
    const img = mapImageRow(row as ImageRow);
    byId.set(img.id, img);
  }

  const orderedImages: Image[] = [];
  for (const id of orderedIds) {
    const img = byId.get(id);
    if (img) {
      orderedImages.push(img);
    }
  }

  const storables = orderedImages.filter(
    (img) => !img.externalUrl?.trim() && Boolean(img.storagePath?.trim()),
  );
  if (storables.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "No downloadable images in selection.",
    };
  }

  const parts = await collectZipParts(storables, project.slug, supabase);
  if (parts.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Could not load any selected files.",
    };
  }

  return {
    ok: true,
    stream: createZipStreamFromParts(parts),
    filename: selectionZipFilename(project.slug),
  };
}
