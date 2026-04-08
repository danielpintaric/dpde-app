import { NextRequest, NextResponse } from "next/server";
import { isSupabaseServiceRoleConfigurationError } from "@/lib/db/supabase-service-role";
import { buildClientSelectionZip } from "@/lib/services/client-download-selected";

export const dynamic = "force-dynamic";

function asciiAttachmentFilename(name: string): string {
  return name.replace(/[^\x20-\x7E]+/g, "_").slice(0, 180) || "selection.zip";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid request.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const raw = body as Record<string, unknown>;
  const token = typeof raw.token === "string" ? raw.token.trim() : "";
  const project = typeof raw.project === "string" ? raw.project.trim() : "";

  if (!token || !project) {
    return new NextResponse("Invalid request.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const built = await buildClientSelectionZip({ token, projectSlug: project });
    if (!built.ok) {
      return new NextResponse(built.message, {
        status: built.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const safe = asciiAttachmentFilename(built.filename);
    return new Response(built.stream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safe.replace(/"/g, "_")}"`,
      },
    });
  } catch (e) {
    if (isSupabaseServiceRoleConfigurationError(e)) {
      return new NextResponse(e.publicMessage, {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    const msg = e instanceof Error ? e.message : "Download failed.";
    return new NextResponse(msg.slice(0, 200), {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
