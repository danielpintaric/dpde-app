import { NextRequest, NextResponse } from "next/server";
import {
  authorizeClientImageDownload,
  downloadFilenameForClientImage,
  loadStorageObjectForDownload,
} from "@/lib/services/client-image-download";

export const dynamic = "force-dynamic";

function asciiContentDispositionFilename(name: string): string {
  return name.replace(/[^\x20-\x7E]+/g, "_").slice(0, 180) || "download.bin";
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const project = request.nextUrl.searchParams.get("project") ?? "";
  const image = request.nextUrl.searchParams.get("image") ?? "";

  const auth = await authorizeClientImageDownload(token, project, image);
  if (!auth.ok) {
    return new NextResponse(auth.message, {
      status: auth.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const loaded = await loadStorageObjectForDownload(auth.image.storagePath.trim());
  if (!loaded.ok) {
    return new NextResponse("File could not be loaded.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const filename = downloadFilenameForClientImage(auth.project.slug, auth.image);
  const asciiName = asciiContentDispositionFilename(filename);
  const buf = await loaded.blob.arrayBuffer();

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": loaded.blob.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiName.replace(/"/g, "_")}"`,
    },
  });
}
